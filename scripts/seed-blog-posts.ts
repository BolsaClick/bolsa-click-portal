#!/usr/bin/env tsx
/**
 * scripts/seed-blog-posts.ts
 *
 * Popula a tabela BlogPost com 20 posts SEO originais gerados via Claude API,
 * usando dados first-party do catálogo (FaculdadeCurso, Institution, FeaturedCourse).
 *
 * USO:
 *   ANTHROPIC_API_KEY=sk-ant-... no .env
 *   node --env-file=.env -r tsx/cjs scripts/seed-blog-posts.ts [flags]
 *
 * FLAGS:
 *   --dry-run            Não escreve no DB, imprime JSON gerado
 *   --slug=<post-slug>   Roda apenas 1 arquétipo (ex: faculdade-administracao-ead-sao-paulo-bolsas)
 *   --limit=<n>          Limita quantos arquétipos roda (default: todos os 20)
 *   --force              Sobrescreve content/title/meta de posts existentes (default: skip)
 *   --concurrency=<n>    Requisições paralelas (default: 2)
 *   --model=<id>         Override do modelo (default: claude-sonnet-4-6)
 *
 * REGRAS EDITORIAIS (também em CLAUDE.md):
 *   - Nunca citar Quero Bolsa, EducaMais Brasil, Vai de Bolsa, Bolsa Universitária
 *   - Preços/MEC apenas do DATA_BLOCK literal (anti-hallucination)
 *   - Fontes externas: .gov.br, conselhos profissionais, parceiros, mídia generalista
 */

import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

// ============================================================
// ARGS
// ============================================================

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const eq = a.indexOf('=')
      return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)]
    }),
) as Record<string, string | boolean>

const DRY_RUN = !!args['dry-run']
const SINGLE_SLUG = (args.slug as string) || undefined
const LIMIT = Number(args.limit) || 0 // 0 = all
const FORCE = !!args.force
const UPDATE_IMAGES_ONLY = !!args['update-images-only']
const CONCURRENCY = Math.max(1, Number(args.concurrency) || 2)
const MODEL = (args.model as string) || 'claude-sonnet-4-6'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const TARTARUS_API = process.env.NEXT_PUBLIC_TARTARUS_API
const HARD_COST_CAP_USD = 5

if (!ANTHROPIC_API_KEY) {
  console.error('ERRO: ANTHROPIC_API_KEY não está no env. Adicione no .env.')
  process.exit(1)
}
if (!TARTARUS_API) {
  console.error('ERRO: NEXT_PUBLIC_TARTARUS_API não está no env.')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
const prisma = new PrismaClient()
const tartarus = axios.create({
  baseURL: TARTARUS_API,
  headers: { 'Content-Type': 'application/json' },
})

// ============================================================
// PRICING (Sonnet 4.6 estimate — atualizar se mudar)
// ============================================================

const PRICE_PER_M_INPUT = 3
const PRICE_PER_M_OUTPUT = 15
const PRICE_PER_M_CACHE_READ = 0.3
const PRICE_PER_M_CACHE_WRITE = 3.75

let totalCostUsd = 0

function addCost(usage: Anthropic.Usage | undefined) {
  if (!usage) return 0
  const input = usage.input_tokens ?? 0
  const output = usage.output_tokens ?? 0
  const cacheRead = (usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0
  const cacheWrite = (usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0
  const cost =
    (input / 1_000_000) * PRICE_PER_M_INPUT +
    (output / 1_000_000) * PRICE_PER_M_OUTPUT +
    (cacheRead / 1_000_000) * PRICE_PER_M_CACHE_READ +
    (cacheWrite / 1_000_000) * PRICE_PER_M_CACHE_WRITE
  totalCostUsd += cost
  return cost
}

// ============================================================
// CATÁLOGO DE CURSOS — slugs reais de app/cursos/_data/cursos.ts
// (mantém-se um subset; o script só usa estes 9 cursos)
// ============================================================

type CursoRef = {
  slug: string            // FeaturedCourse.slug local
  apiCourseName: string   // courseName pra tartarus
  name: string
  nivel: 'GRADUACAO' | 'POS_GRADUACAO'
  imagePath: string       // /public/assets/images/* — usado em featuredImage
}

const DEFAULT_IMAGE = '/assets/og-image-bolsaclick.png'

const CURSOS: Record<string, CursoRef> = {
  administracao: { slug: 'administracao-bacharelado', apiCourseName: 'Administração', name: 'Administração', nivel: 'GRADUACAO', imagePath: '/assets/images/adm.jpg' },
  direito: { slug: 'direito-bacharelado', apiCourseName: 'Direito', name: 'Direito', nivel: 'GRADUACAO', imagePath: '/assets/images/direito.webp' },
  enfermagem: { slug: 'enfermagem-bacharelado', apiCourseName: 'Enfermagem', name: 'Enfermagem', nivel: 'GRADUACAO', imagePath: '/assets/images/enfermagem.jpeg' },
  psicologia: { slug: 'psicologia-bacharelado', apiCourseName: 'Psicologia', name: 'Psicologia', nivel: 'GRADUACAO', imagePath: '/assets/images/psicologia.webp' },
  pedagogia: { slug: 'pedagogia-licenciatura', apiCourseName: 'Pedagogia', name: 'Pedagogia', nivel: 'GRADUACAO', imagePath: '/assets/images/pedagogia.jpg' },
  ads: { slug: 'analise-e-desenvolvimento-de-sistemas-tecnologo', apiCourseName: 'Análise e Desenvolvimento de Sistemas', name: 'Análise e Desenvolvimento de Sistemas', nivel: 'GRADUACAO', imagePath: '/assets/images/analise-e-desenvolvimento-de-sistemas.jpeg' },
  engenharia_civil: { slug: 'engenharia-civil-bacharelado', apiCourseName: 'Engenharia Civil', name: 'Engenharia Civil', nivel: 'GRADUACAO', imagePath: '/assets/images/engenharia-civil.jpg' },
  contabeis: { slug: 'ciencias-contabeis-bacharelado', apiCourseName: 'Ciências Contábeis', name: 'Ciências Contábeis', nivel: 'GRADUACAO', imagePath: '/assets/images/ciencias-contabeis.jpg' },
  educacao_fisica: { slug: 'educacao-fisica-licenciatura', apiCourseName: 'Educação Física', name: 'Educação Física', nivel: 'GRADUACAO', imagePath: '/assets/images/educacao-fisica.jpeg' },
}

function imageForArchetype(arch: { cursoKey?: keyof typeof CURSOS }): string {
  if (arch.cursoKey) return CURSOS[arch.cursoKey].imagePath
  return DEFAULT_IMAGE
}

type CityRef = { name: string; state: string; slug: string }

const CIDADES: Record<string, CityRef> = {
  sp: { name: 'São Paulo', state: 'SP', slug: 'sao-paulo' },
  rj: { name: 'Rio de Janeiro', state: 'RJ', slug: 'rio-de-janeiro' },
  bh: { name: 'Belo Horizonte', state: 'MG', slug: 'belo-horizonte' },
  bsb: { name: 'Brasília', state: 'DF', slug: 'brasilia' },
  ssa: { name: 'Salvador', state: 'BA', slug: 'salvador' },
  cwb: { name: 'Curitiba', state: 'PR', slug: 'curitiba' },
  rec: { name: 'Recife', state: 'PE', slug: 'recife' },
  poa: { name: 'Porto Alegre', state: 'RS', slug: 'porto-alegre' },
}

// ============================================================
// CATEGORIAS
// ============================================================

type CategoryDef = {
  slug: string
  title: string
  description: string
  order: number
  metaTitle?: string
  metaDescription?: string
}

const CATEGORIES: CategoryDef[] = [
  {
    slug: 'bolsas-de-estudo',
    title: 'Bolsas de Estudo',
    description: 'Como conseguir bolsa de estudo na faculdade, % de desconto, programas e tipos de bolsa.',
    order: 1,
    metaTitle: 'Bolsas de Estudo para Faculdade | Bolsa Click',
    metaDescription: 'Guia completo sobre bolsas de estudo para faculdade — como conseguir, % de desconto, instituições parceiras e programas.',
  },
  {
    slug: 'cursos-de-graduacao',
    title: 'Cursos de Graduação',
    description: 'Tudo sobre cursos de graduação: duração, áreas, mercado e carreira.',
    order: 2,
    metaTitle: 'Cursos de Graduação no Brasil | Bolsa Click',
    metaDescription: 'Guia de cursos de graduação no Brasil: duração, mercado, salário, áreas de atuação e bolsas disponíveis.',
  },
  {
    slug: 'ead',
    title: 'EAD e Ensino a Distância',
    description: 'Tudo sobre faculdade EAD: como funciona, vantagens, modalidades semipresenciais e híbridas.',
    order: 3,
    metaTitle: 'Faculdade EAD: Guia Completo do Ensino a Distância | Bolsa Click',
    metaDescription: 'Faculdade EAD reconhecida pelo MEC: como funciona, vantagens, mensalidades e bolsas para ensino a distância.',
  },
  {
    slug: 'faculdades-por-cidade',
    title: 'Faculdades por Cidade',
    description: 'Faculdades por cidade no Brasil: polos, mensalidades e bolsas em cada região.',
    order: 4,
    metaTitle: 'Faculdades por Cidade no Brasil | Bolsa Click',
    metaDescription: 'Lista de faculdades reconhecidas pelo MEC em cada cidade do Brasil, com bolsas, mensalidades e modalidades.',
  },
  {
    slug: 'carreira-e-mercado',
    title: 'Carreira e Mercado',
    description: 'Mercado de trabalho, salário, carreira e perspectivas profissionais por curso.',
    order: 5,
    metaTitle: 'Carreira, Salário e Mercado de Trabalho | Bolsa Click',
    metaDescription: 'Salário, mercado de trabalho e perspectivas de carreira para cada curso de graduação no Brasil.',
  },
  {
    slug: 'guias-mec',
    title: 'MEC, Reconhecimento e Avaliação',
    description: 'Como o MEC avalia faculdades, notas no e-MEC, ENADE, CPC e reconhecimento de cursos.',
    order: 6,
    metaTitle: 'Faculdades MEC: Reconhecimento e Notas | Bolsa Click',
    metaDescription: 'Como verificar reconhecimento de faculdade no MEC, notas do ENADE, CPC e avaliação institucional.',
  },
]

// ============================================================
// ARQUÉTIPOS DOS 20 POSTS
// ============================================================

type Archetype = {
  slug: string
  title: string
  kind: 'curso_cidade' | 'curso' | 'ranking' | 'guia'
  cursoKey?: keyof typeof CURSOS
  cityKey?: keyof typeof CIDADES
  modality?: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  categorySlugs: string[]
  featured?: boolean
  briefing: string // 1-2 frases pro modelo entender o ângulo
}

const ARCHETYPES: Archetype[] = [
  // ---- 8 curso × cidade ----
  {
    slug: 'faculdade-administracao-ead-sao-paulo-bolsas',
    title: 'Faculdade de Administração EAD em São Paulo: bolsas de até 85%',
    kind: 'curso_cidade', cursoKey: 'administracao', cityKey: 'sp', modality: 'EAD',
    categorySlugs: ['ead', 'faculdades-por-cidade', 'bolsas-de-estudo'],
    featured: true,
    briefing: 'Foco em quem mora em SP e quer fazer Administração EAD com bolsa. Mostrar faculdades reais, % de bolsa máxima, mensalidades e MEC.',
  },
  {
    slug: 'faculdade-direito-belo-horizonte-bolsas-mec',
    title: 'Faculdade de Direito em Belo Horizonte: bolsas, MEC e mensalidades',
    kind: 'curso_cidade', cursoKey: 'direito', cityKey: 'bh', modality: 'PRESENCIAL',
    categorySlugs: ['faculdades-por-cidade', 'bolsas-de-estudo', 'guias-mec'],
    featured: true,
    briefing: 'Direito presencial em BH. Falar de OAB, nota MEC, instituições com tradição, mensalidades reais com bolsa.',
  },
  {
    slug: 'enfermagem-ead-rio-janeiro-faculdades-bolsa',
    title: 'Enfermagem EAD no Rio de Janeiro: faculdades reconhecidas com bolsa',
    kind: 'curso_cidade', cursoKey: 'enfermagem', cityKey: 'rj', modality: 'EAD',
    categorySlugs: ['ead', 'faculdades-por-cidade', 'guias-mec'],
    briefing: 'Enfermagem EAD ainda gera dúvida (a parte prática é presencial). Esclarecer modalidade semipresencial + estágios + COREN.',
  },
  {
    slug: 'psicologia-curitiba-bolsas-mec',
    title: 'Psicologia em Curitiba: bolsas de estudo e nota MEC das faculdades',
    kind: 'curso_cidade', cursoKey: 'psicologia', cityKey: 'cwb', modality: 'PRESENCIAL',
    categorySlugs: ['faculdades-por-cidade', 'bolsas-de-estudo', 'carreira-e-mercado'],
    briefing: 'Psicologia presencial em Curitiba. CRP, áreas de atuação, mercado local.',
  },
  {
    slug: 'pedagogia-ead-salvador-bolsas',
    title: 'Pedagogia EAD em Salvador: faculdades com bolsa de 50%+',
    kind: 'curso_cidade', cursoKey: 'pedagogia', cityKey: 'ssa', modality: 'EAD',
    categorySlugs: ['ead', 'faculdades-por-cidade', 'bolsas-de-estudo'],
    briefing: 'Pedagogia EAD em Salvador. Foco em concurso público, licenciatura, mercado educacional na BA.',
  },
  {
    slug: 'ads-brasilia-faculdades-ead-bolsa',
    title: 'ADS em Brasília: faculdades EAD com bolsa e nota MEC',
    kind: 'curso_cidade', cursoKey: 'ads', cityKey: 'bsb', modality: 'EAD',
    categorySlugs: ['ead', 'cursos-de-graduacao', 'faculdades-por-cidade'],
    briefing: 'Análise e Desenvolvimento de Sistemas em Brasília. Mercado público (concurso) + iniciativa privada de TI.',
  },
  {
    slug: 'engenharia-civil-recife-faculdades-bolsas',
    title: 'Engenharia Civil em Recife: faculdades, bolsas e mercado',
    kind: 'curso_cidade', cursoKey: 'engenharia_civil', cityKey: 'rec', modality: 'PRESENCIAL',
    categorySlugs: ['faculdades-por-cidade', 'cursos-de-graduacao', 'carreira-e-mercado'],
    briefing: 'Engenharia Civil presencial em Recife. CREA, construção civil no Nordeste, polos universitários.',
  },
  {
    slug: 'contabeis-ead-porto-alegre-bolsa',
    title: 'Ciências Contábeis EAD em Porto Alegre com bolsa',
    kind: 'curso_cidade', cursoKey: 'contabeis', cityKey: 'poa', modality: 'EAD',
    categorySlugs: ['ead', 'faculdades-por-cidade', 'bolsas-de-estudo'],
    briefing: 'Contábeis EAD em POA. CFC, perícia contábil, mercado de TI fiscal.',
  },

  // ---- 6 curso-genérico ----
  {
    slug: 'faculdade-administracao-ead-guia',
    title: 'Faculdade de Administração EAD: tudo sobre o curso em 2026',
    kind: 'curso', cursoKey: 'administracao', modality: 'EAD',
    categorySlugs: ['cursos-de-graduacao', 'ead'],
    briefing: 'Guia completo de Administração EAD em 2026. Currículo, áreas, salário, dia a dia, perfil ideal.',
  },
  {
    slug: 'faculdade-direito-ead-mec-oab',
    title: 'Faculdade de Direito EAD existe? O que diz o MEC e a OAB',
    kind: 'curso', cursoKey: 'direito', modality: 'EAD',
    categorySlugs: ['cursos-de-graduacao', 'guias-mec'],
    briefing: 'Pergunta clássica: Direito EAD existe? Esclarecer regra MEC + exigência da OAB de presencial. Responder direto.',
  },
  {
    slug: 'faculdade-enfermagem-mercado-salario',
    title: 'Faculdade de Enfermagem: duração, mercado e salário do enfermeiro',
    kind: 'curso', cursoKey: 'enfermagem',
    categorySlugs: ['cursos-de-graduacao', 'carreira-e-mercado'],
    briefing: 'Visão geral de Enfermagem: 5 anos, COREN, áreas (hospital, saúde pública, home care), salário real.',
  },
  {
    slug: 'faculdade-psicologia-areas-atuacao-crp',
    title: 'Faculdade de Psicologia: 5 anos, áreas de atuação e CRP',
    kind: 'curso', cursoKey: 'psicologia',
    categorySlugs: ['cursos-de-graduacao', 'carreira-e-mercado'],
    briefing: 'Psicologia: 5 anos de curso, CRP, áreas (clínica, organizacional, escolar, hospitalar), mercado.',
  },
  {
    slug: 'ads-vs-engenharia-software',
    title: 'ADS ou Engenharia de Software? Diferenças, mercado e salário',
    kind: 'curso', cursoKey: 'ads',
    categorySlugs: ['cursos-de-graduacao', 'carreira-e-mercado'],
    briefing: 'Comparativo ADS (tecnólogo 2 anos) vs Engenharia de Software (bacharelado 4 anos). Quando faz sentido cada um.',
  },
  {
    slug: 'pedagogia-ead-licenciatura-concurso',
    title: 'Pedagogia EAD: o curso, a licenciatura e o concurso público',
    kind: 'curso', cursoKey: 'pedagogia', modality: 'EAD',
    categorySlugs: ['ead', 'cursos-de-graduacao', 'carreira-e-mercado'],
    briefing: 'Pedagogia EAD como rota pra concurso público (prefeitura, estado). Licenciatura, áreas.',
  },

  // ---- 3 ranking ----
  {
    slug: 'cursos-ead-mais-procurados-2026',
    title: '10 cursos EAD mais procurados em 2026 (com bolsa)',
    kind: 'ranking',
    categorySlugs: ['ead', 'cursos-de-graduacao'],
    featured: true,
    briefing: 'Top 10 cursos EAD com mais busca em 2026: Admin, Pedagogia, ADS, RH, Marketing, Contábeis, Logística, etc. Por que cada um. Não inventar números — falar tendência genérica.',
  },
  {
    slug: 'faculdades-ead-nota-mec-bolsas',
    title: 'Top 7 faculdades EAD com nota MEC alta e bolsas',
    kind: 'ranking',
    categorySlugs: ['ead', 'guias-mec', 'bolsas-de-estudo'],
    briefing: 'Faculdades EAD com melhor nota MEC + oferta de bolsa. Anhanguera, Unopar, Pitágoras e parceiras. Usar DATA_BLOCK.',
  },
  {
    slug: 'ead-vs-presencial-bolsa',
    title: 'EAD x Presencial: qual modalidade rende mais bolsa?',
    kind: 'ranking',
    categorySlugs: ['ead', 'bolsas-de-estudo'],
    briefing: 'Comparativo: EAD costuma ter mensalidade menor + bolsa de até X%. Presencial tem benefícios diferentes. Quando cada um faz sentido.',
  },

  // ---- 3 guia ----
  {
    slug: 'como-conseguir-bolsa-estudo-50-faculdade',
    title: 'Como conseguir bolsa de estudo de 50% ou mais na faculdade',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Guia prático: tipos de bolsa (Prouni, Fies, bolsas próprias da faculdade, parcerias agregadoras), elegibilidade, passo a passo.',
  },
  {
    slug: 'faculdade-reconhecida-mec-como-verificar',
    title: 'Faculdade reconhecida pelo MEC: como verificar antes de matricular',
    kind: 'guia',
    categorySlugs: ['guias-mec'],
    briefing: 'Passo a passo no e-MEC: como buscar instituição, conferir nota CPC, ENADE, IGC. Diferença entre autorizado/reconhecido/credenciado.',
  },
  {
    slug: 'quanto-custa-faculdade-ead-2026',
    title: 'Quanto custa uma faculdade EAD em 2026? Preços reais por curso',
    kind: 'guia',
    categorySlugs: ['ead', 'bolsas-de-estudo'],
    briefing: 'Preços reais 2026 por curso EAD. Usar dados do DATA_BLOCK (faixas de mensalidade por curso). Sem inventar números.',
  },

  // ===========================================================
  // CLUSTER "BOLSAS DE ESTUDO" — head term em 6m (decisão 2026-05-22)
  // Pillar /bolsas-de-estudo cobre Prouni/Fies/tipos/passo-a-passo.
  // Estes archetypes atacam variantes long-tail identificadas na SERP.
  // Todo post DEVE linkar pra /bolsas-de-estudo no primeiro terço.
  // ===========================================================

  // ---- Programas federais (6 posts) ----
  {
    slug: 'prouni-2026-como-funciona-passo-a-passo',
    title: 'ProUni 2026: como funciona, requisitos e passo-a-passo',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    featured: true,
    briefing: 'Guia completo do ProUni 2026: o que é, quem pode se inscrever (ENEM 450+, renda até 3 SM, escola pública), bolsa 50 vs 100%, datas das duas edições anuais, documentação, lista de espera. Citar fontes .gov.br (MEC). Linkar pra /bolsas-de-estudo no primeiro terço com anchor "guia completo de bolsas de estudo".',
  },
  {
    slug: 'fies-2026-financiamento-estudantil-completo',
    title: 'FIES 2026: financiamento estudantil federal explicado',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    featured: true,
    briefing: 'Guia do FIES 2026: como funciona o financiamento, juros baixos, requisitos (ENEM 450+, renda até 3 SM), prazo de pagamento após formado, P-FIES vs FIES. Diferença pro ProUni. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'prouni-ou-fies-qual-vale-mais-a-pena',
    title: 'ProUni ou FIES: qual programa vale mais a pena em 2026?',
    kind: 'ranking',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    briefing: 'Comparativo direto ProUni vs FIES com tabela: tipo de benefício (bolsa vs financiamento), pagamento, juros, prazo, perfis ideais. Quando combinar os dois (ProUni 50% + FIES 50%). Linkar pra /bolsas-de-estudo, /prouni, /fies.',
  },
  {
    slug: 'nota-minima-enem-prouni-quanto-precisa',
    title: 'Nota mínima do ENEM pra ProUni: 450 pontos e o que mais conta',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    briefing: 'Nota mínima formal é 450 + redação acima de zero, mas a nota de corte real por curso/faculdade varia. Explicar como funciona o ranking de seleção (maior nota leva). Exemplos de cursos populares e suas notas históricas. Linkar pra /bolsas-de-estudo e /prouni.',
  },
  {
    slug: 'sisu-prouni-fies-diferencas-programas-federais',
    title: 'SISU, ProUni e FIES: 3 programas federais para a faculdade',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    briefing: 'Trilha de decisão entre os 3 programas federais. SISU = vaga em pública. ProUni = bolsa em particular. FIES = financiamento em particular. Quando cada um faz sentido. Linkar pra /bolsas-de-estudo, /sisu, /prouni, /fies.',
  },
  {
    slug: 'bolsa-permanencia-mec-auxilio-mensal',
    title: 'Bolsa de permanência MEC: auxílio mensal para bolsistas ProUni',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    briefing: 'O que é Bolsa de Permanência (BP-MEC), quem tem direito (bolsista ProUni 100% + renda até 1,5 SM + curso com carga horária mínima), valor mensal e como solicitar. Bolsa específica indígenas/quilombolas. Linkar pra /bolsas-de-estudo seção bolsa-permanencia.',
  },

  // ---- Por perfil de estudante (5 posts) ----
  {
    slug: 'bolsa-de-estudo-sem-enem-como-conseguir',
    title: 'Bolsa de estudo sem ENEM: como conseguir sem fazer a prova',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    featured: true,
    briefing: 'Pra quem não fez ou não quer fazer ENEM: bolsas próprias de faculdades parceiras aceitam processo seletivo próprio (redação online). Listar caminhos. Não citar concorrentes. Linkar pra /bolsas-de-estudo e /sem-enem.',
  },
  {
    slug: 'bolsa-de-estudo-baixa-renda-prouni-permanencia',
    title: 'Bolsa de estudo para baixa renda: ProUni, FIES e auxílio do MEC',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Conjunto de benefícios pra estudantes de baixa renda: ProUni 100%, Bolsa Permanência, FIES, transporte e alimentação. Como combinar e maximizar. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'bolsa-de-estudo-primeira-graduacao-familia',
    title: 'Bolsa de estudo para quem é primeira graduação na família',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'carreira-e-mercado'],
    briefing: 'Caminho pra "primeira geração universitária": cuidados extra na escolha, programas que priorizam esse perfil (cota PROUNI escola pública), apoio acadêmico. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'bolsa-de-estudo-segunda-graduacao-pode',
    title: 'Posso conseguir bolsa de estudo pra segunda graduação?',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'ProUni e FIES proíbem segunda graduação (precisa não ter diploma). Mas bolsa própria via faculdade parceira permite. Explicar regras e caminho. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'bolsa-de-estudo-pos-graduacao-mba-especializacao',
    title: 'Bolsa de estudo para pós-graduação: MBA e especialização',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Pós lato sensu (MBA, especialização) tem bolsa via faculdades parceiras (30-70%). Mestrado/doutorado = CAPES/CNPq. Trilha por nível. Linkar pra /bolsas-de-estudo e /pos-graduacao.',
  },

  // ---- Por tipo/modalidade de bolsa (5 posts) ----
  {
    slug: 'bolsa-integral-100-como-conseguir-2026',
    title: 'Bolsa de estudo de 100%: como conseguir bolsa integral em 2026',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    featured: true,
    briefing: 'Bolsa integral cobre 100% da mensalidade. Caminhos: ProUni 100% (ENEM + renda baixa) ou bolsa própria 100% em vagas específicas de faculdades parceiras. Linkar pra /bolsas-de-estudo seção tipos.',
  },
  {
    slug: 'bolsa-50-vs-100-qual-vale-mais',
    title: 'Bolsa de 50% ou 100%: qual vale mais a pena?',
    kind: 'ranking',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Comparativo de bolsa integral vs parcial. Bolsa 100% rende mais mas tem critério mais apertado (renda 1,5 SM). Bolsa 50% (renda até 3 SM) ainda dá grande economia. NÃO INVENTAR PREÇOS — use APENAS valores presentes no DATA_BLOCK.allowedPrices, ou fale em percentuais e faixas genéricas ("metade da mensalidade", "economia de até 50% do custo total") sem citar reais específicos. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'bolsa-ead-vs-bolsa-presencial-diferenca',
    title: 'Bolsa de estudo EAD ou presencial: onde o desconto é maior',
    kind: 'ranking',
    categorySlugs: ['bolsas-de-estudo', 'ead'],
    briefing: 'Comparativo: EAD chega a 85% via bolsa própria (mensalidade base já menor), presencial fica em 30-70% típico. Casos onde presencial compensa (curso prático). Linkar pra /bolsas-de-estudo e /faculdade-ead.',
  },
  {
    slug: 'faculdade-ead-mais-barata',
    title: 'Faculdade EAD mais barata: como achar mensalidade baixa em 2026',
    kind: 'guia',
    categorySlugs: ['ead', 'bolsas-de-estudo'],
    featured: true,
    briefing: 'Responder direto qual o caminho pra conseguir a faculdade EAD mais barata: a mensalidade EAD já parte de um valor menor que o presencial e a bolsa própria de faculdades parceiras derruba ainda mais o preço (descontos chegam a 85% sem nota de corte). REGRA INEGOCIÁVEL DE PREÇO: cite APENAS valores presentes em DATA_BLOCK.allowedPrices — NÃO invente mensalidades, médias nem faixas em reais que não estejam ali; quando não houver preço, fale qualitativamente ("mensalidades a partir de valores acessíveis", "economia de até X% com bolsa") sem citar R$ específico. Cobrir: quais cursos EAD costumam ter a mensalidade mais baixa (Pedagogia, ADS, Administração, Gestão), como a bolsa própria reduz o valor mês a mês, comparativo de custo EAD x presencial, e um alerta editorial forte: barato não pode significar não reconhecido — sempre conferir o reconhecimento no e-MEC mesmo quando o preço chama atenção. Incluir tabela comparando cursos/faixas e a seção Perguntas frequentes. Linkar pra /bolsas-de-estudo com anchor "guia completo de bolsas de estudo" e pra /faculdade-ead no primeiro terço.',
  },
  {
    slug: 'bolsa-cursos-profissionalizantes-tecnico',
    title: 'Bolsa de estudo para cursos profissionalizantes e técnicos',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Bolsas pra cursos técnicos e profissionalizantes: programas estaduais (ex: Pronatec), bolsa própria de escolas técnicas, FIES Técnico. Diferente da bolsa de graduação. Linkar pra /bolsas-de-estudo e /cursos-profissionalizantes.',
  },
  {
    slug: 'simulador-bolsa-de-estudo-quanto-economizo',
    title: 'Quanto economizo com bolsa de estudo? Simulação por curso',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Cálculos de economia ao longo de um curso (4-5 anos) com diferentes percentuais de bolsa. REGRA INEGOCIÁVEL: cite APENAS valores que estão em DATA_BLOCK.allowedPrices ou DATA_BLOCK.offers. NÃO INVENTE preços. Para cálculos genéricos use percentuais ("economia de 50% do total", "três quartos da mensalidade", "metade dos 4-5 anos pagando zero"). Pra exemplos com R$, use SOMENTE valores que aparecem literalmente no DATA_BLOCK. Linkar pra /bolsas-de-estudo.',
  },

  // ---- Cuidados e validação (4 posts) ----
  {
    slug: 'bolsa-de-estudo-golpe-como-evitar',
    title: 'Bolsa de estudo golpe: como identificar antes de pagar',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    briefing: 'Sinais de golpe em bolsa: cobrança antecipada, faculdade não cadastrada no e-MEC, promessa de desconto excepcional. Como validar com 3 passos. Linkar pra /bolsas-de-estudo seção cuidados.',
  },
  {
    slug: 'como-verificar-faculdade-emec-passo-a-passo',
    title: 'Como verificar faculdade no e-MEC: tutorial em 5 passos',
    kind: 'guia',
    categorySlugs: ['guias-mec', 'bolsas-de-estudo'],
    briefing: 'Tutorial prático do portal e-mec.mec.gov.br: buscar instituição, conferir credenciamento, nota CPC, nota ENADE, IGC. Captura de tela textual. Citar mec.gov.br. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'posso-perder-bolsa-de-estudo-motivos',
    title: 'Posso perder a bolsa de estudo durante o curso? 7 motivos',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo'],
    briefing: 'Lista de motivos de perda de bolsa (ProUni e bolsa própria): reprovação, trancamento, atraso, mudança de renda. Como evitar cada um. Linkar pra /bolsas-de-estudo.',
  },
  {
    slug: 'documentos-bolsa-de-estudo-prouni-fies',
    title: 'Documentos para bolsa de estudo: o que levar pro ProUni e FIES',
    kind: 'guia',
    categorySlugs: ['bolsas-de-estudo', 'guias-mec'],
    briefing: 'Checklist: RG, CPF, comprovante de residência, comprovante de renda (CT, holerite, IR), boletim ENEM, histórico escolar. Diferença bolsa integral vs parcial. Linkar pra /bolsas-de-estudo.',
  },
]

// ============================================================
// FILTROS ANTI-CONCORRENTE
// ============================================================

const FORBIDDEN_BRANDS: RegExp[] = [
  /\bquero\s*bolsa\b/i,
  /\beduca\s*mais\s*brasil\b/i,
  /\beduca\s*mais\b/i,
  /\bvai\s+de\s+bolsa\b/i,
  /\bbolsa\s+universit[áa]ria\b/i,
  /\bbolsasdeestudo\.com\b/i,
]

// ============================================================
// SYSTEM PROMPT (cacheado)
// ============================================================

const SYSTEM_PROMPT = `Você é editor sênior de conteúdo SEO do Bolsa Click, plataforma brasileira de bolsas de estudo. Escreve em português do Brasil, tom informativo e direto, sem hype.

REGRAS INEGOCIÁVEIS:

1. CONTEÚDO 100% ORIGINAL — proibido reproduzir, parafrasear ou imitar texto de sites concorrentes.

2. PROIBIDO citar, linkar ou mencionar pelo nome:
   - Quero Bolsa
   - EducaMais Brasil (ou "Educa Mais")
   - Vai de Bolsa
   - Bolsa Universitária
   - Qualquer outro agregador concorrente de bolsas
   Se precisar comparar, use termos genéricos ("plataformas agregadoras", "outros sites de bolsa") sem nomes.

3. ANTI-HALLUCINATION — para valores monetários (preços, mensalidades, R$), use APENAS números que apareçam no array "allowedPrices" do DATA_BLOCK. Está PROIBIDO inventar mensalidades, médias ou faixas que não estejam ali. Se "allowedPrices" estiver vazio, NÃO cite nenhum preço específico no texto — fale qualitativamente ("mensalidades acessíveis", "valores que variam conforme a instituição"). Para nota MEC, salário, % de bolsa e duração, use APENAS valores do DATA_BLOCK. Se um dado não estiver presente, omita. Se isNationalFallback=true, mencione no texto que os preços são médias nacionais.

4. FONTES EXTERNAS CITÁVEIS (apenas quando relevante, citar por nome sem URL):
   - .gov.br: MEC, INEP, e-MEC, IBGE, CAGED, CBO
   - Conselhos profissionais: CFA, CRP, CFM, CREA, OAB, CFC, CFO, COREN
   - Parceiros: Anhanguera, Unopar, Pitágoras (sites institucionais)
   - Mídia: G1, UOL, Folha de S.Paulo, Estadão, Valor Econômico

5. ESTRUTURA HTML obrigatória no campo "content":
   - Hierarquia <h2> → <h3> (NUNCA usar <h1>; a página já renderiza o título)
   - 3+ <h2> com seções claras
   - 1+ <ul> ou <ol>
   - <table> quando comparar mensalidades, modalidades ou notas MEC
   - <p> para parágrafos (2–4 linhas cada)
   - NÃO usar <html>, <body>, <head>, <script>
   - Pode usar <strong>, <em>, <blockquote>

6. TAMANHO E ESTRUTURA EDITORIAL:
   - 1200 a 2500 palavras no content
   - Sempre incluir uma seção <h2>Perguntas frequentes</h2> com 3–5 perguntas em <h3>
   - Sempre encerrar com CTA suave: "Compare ofertas de bolsa no Bolsa Click" ou similar
   - Tom: prático, direto, sem clichê ("descubra agora", "venha conhecer", "garanta sua vaga" são proibidos)

7. ABERTURA — RESPOSTA DIRETA (crítico para AI search / Perplexity / ChatGPT):
   O primeiro parágrafo do "content" DEVE responder a query principal do post nos primeiros 40-60 palavras, sem contextualização prévia. LLMs extraem o primeiro bloco semântico como snippet de citação; contexto antes da resposta faz o conteúdo perder visibilidade em AI Overviews.

   PADRÃO ERRADO (contextualiza primeiro):
   "Antes de sair se inscrevendo em qualquer bolsa, é importante entender..."

   PADRÃO CORRETO (resposta direta + contexto depois):
   "Pra conseguir bolsa de 50% ou mais, o caminho mais rápido é candidatar-se ao Prouni via ENEM ou buscar bolsas próprias de faculdades EAD parceiras, onde os descontos chegam a 85% sem nota de corte. Veja como cada opção funciona..."

8. FORMATO DE SAÍDA — você DEVE chamar a tool "submit_blog_post" com os argumentos no schema definido. Não responda com texto livre.`

// ============================================================
// DATA BLOCK
// ============================================================

type Offer = {
  institution: string
  modality: string | null
  minPrice: number | null
  maxPrice: number | null
  mecRating: number | null
}

type DataBlock = {
  archetype: Archetype['kind']
  titleHint: string
  briefing: string
  curso?: {
    name: string
    nivel: string
    apiCourseName: string
  }
  city?: { name: string; state: string }
  modality?: string
  offers: Offer[]
  offerCount: number
  isNationalFallback: boolean
  noOffers: boolean
  priceStats?: {
    minWithDiscount: number
    maxWithDiscount: number
    avgWithDiscount: number
    avgWithoutDiscount: number
    avgDiscountPct: number
  }
  allowedPrices: number[] // valores literais que o modelo pode citar (R$ X)
  topInstitutions: { name: string; mecRating: number | null }[]
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function loadMecRatings(): Promise<Record<string, number>> {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true, mecRating: { not: null } },
    select: { slug: true, name: true, mecRating: true },
  })
  const result: Record<string, number> = {}
  for (const inst of institutions) {
    if (inst.mecRating == null) continue
    result[inst.slug] = inst.mecRating
    const nameKey = normalize(inst.name)
    if (nameKey && nameKey !== inst.slug) result[nameKey] = inst.mecRating
  }
  return result
}

type RawOffer = {
  brand?: string
  institutionName?: string
  modality?: string
  commercialModality?: string
  minPrice?: number
  maxPrice?: number
  prices?: { withDiscount?: number; withoutDiscount?: number }
}

async function fetchOffers(
  courseName: string,
  city: string | undefined,
  state: string | undefined,
  modality: string | undefined,
  nivel: string,
): Promise<{ offers: RawOffer[]; isNationalFallback: boolean; modalityRelaxed: boolean }> {
  const serializer = (p: Record<string, string | number | string[]>) => {
    const sp = new URLSearchParams()
    Object.entries(p).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)))
      else if (v != null) sp.append(k, String(v))
    })
    return sp.toString()
  }

  type Attempt = { city?: string; state?: string; modality?: string; isNationalFallback: boolean; modalityRelaxed: boolean }
  const attempts: Attempt[] = [
    { city, state, modality, isNationalFallback: false, modalityRelaxed: false },
    { modality, isNationalFallback: true, modalityRelaxed: false },     // remove cidade/estado, mantém modalidade
    { city, state, isNationalFallback: false, modalityRelaxed: true },  // remove modalidade, mantém cidade
    { isNationalFallback: true, modalityRelaxed: true },                 // último recurso: só curso + nível
  ]

  for (const a of attempts) {
    // pula attempt sem cidade quando o input não tinha cidade (evita duplicado)
    if (!a.city && !city && a.isNationalFallback === false) continue

    const params: Record<string, string | number | string[]> = {
      page: 1, size: 20, academicLevel: [nivel], courseName,
    }
    if (a.city) params.city = a.city
    if (a.state) params.state = a.state
    if (a.modality) params.modality = [a.modality.toUpperCase()]

    try {
      const resp = await tartarus.get('cogna/courses/search', { params, paramsSerializer: serializer })
      const data = resp.data?.data
      if (Array.isArray(data) && data.length > 0) {
        return { offers: data as RawOffer[], isNationalFallback: a.isNationalFallback, modalityRelaxed: a.modalityRelaxed }
      }
    } catch (err) {
      console.warn(`  ⚠️  tartarus falhou (city=${a.city ?? '-'}, mod=${a.modality ?? '-'}):`, (err as Error).message)
    }
  }
  return { offers: [], isNationalFallback: false, modalityRelaxed: false }
}

function mapOffer(raw: RawOffer, mecMap: Record<string, number>): Offer {
  const minPrice = raw.prices?.withDiscount ?? raw.minPrice ?? null
  const maxPrice = raw.prices?.withoutDiscount ?? raw.maxPrice ?? null
  const inst = raw.brand ?? raw.institutionName ?? 'Instituição'
  const mecKey = normalize(inst)
  return {
    institution: inst,
    modality: raw.modality ?? raw.commercialModality ?? null,
    minPrice,
    maxPrice,
    mecRating: mecMap[mecKey] ?? null,
  }
}

async function buildDataBlock(arch: Archetype, mecMap: Record<string, number>): Promise<DataBlock> {
  const curso = arch.cursoKey ? CURSOS[arch.cursoKey] : undefined
  const city = arch.cityKey ? CIDADES[arch.cityKey] : undefined

  let offers: Offer[] = []
  let isNationalFallback = false

  let modalityRelaxed = false
  if (curso) {
    const result = await fetchOffers(
      curso.apiCourseName,
      city?.name,
      city?.state,
      arch.modality,
      curso.nivel,
    )
    offers = result.offers.slice(0, 8).map((r) => mapOffer(r, mecMap))
    isNationalFallback = result.isNationalFallback
    modalityRelaxed = result.modalityRelaxed
  } else if (arch.kind === 'ranking' || arch.kind === 'guia') {
    const sampleCourses = ['Administração', 'Pedagogia', 'Análise e Desenvolvimento de Sistemas']
    for (const cName of sampleCourses) {
      const { offers: raw } = await fetchOffers(cName, undefined, undefined, 'EAD', 'GRADUACAO')
      const sample = raw.slice(0, 3).map((r) => mapOffer(r, mecMap))
      offers.push(...sample)
    }
    offers = offers.slice(0, 12)
  }
  void modalityRelaxed

  const validPrices = offers
    .map((o) => o.minPrice)
    .filter((p): p is number => typeof p === 'number' && p > 0)
  const validMax = offers
    .map((o) => o.maxPrice)
    .filter((p): p is number => typeof p === 'number' && p > 0)

  const priceStats = validPrices.length > 0 ? {
    minWithDiscount: Math.round(Math.min(...validPrices)),
    maxWithDiscount: Math.round(Math.max(...validPrices)),
    avgWithDiscount: Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length),
    avgWithoutDiscount: validMax.length ? Math.round(validMax.reduce((a, b) => a + b, 0) / validMax.length) : 0,
    avgDiscountPct: validMax.length && validPrices.length
      ? Math.round(
          ((validMax.reduce((a, b) => a + b, 0) / validMax.length) -
            (validPrices.reduce((a, b) => a + b, 0) / validPrices.length)) /
          (validMax.reduce((a, b) => a + b, 0) / validMax.length) * 100,
        )
      : 0,
  } : undefined

  // Top instituições únicas por MEC rating
  const seen = new Set<string>()
  const topInstitutions: { name: string; mecRating: number | null }[] = []
  for (const o of offers) {
    if (seen.has(o.institution)) continue
    seen.add(o.institution)
    topInstitutions.push({ name: o.institution, mecRating: o.mecRating })
    if (topInstitutions.length >= 6) break
  }
  topInstitutions.sort((a, b) => (b.mecRating ?? 0) - (a.mecRating ?? 0))

  // Lista explícita de preços que o modelo PODE citar no texto
  const allowedPrices = Array.from(new Set([
    ...validPrices.map((p) => Math.round(p)),
    ...validMax.map((p) => Math.round(p)),
    ...(priceStats ? [
      priceStats.minWithDiscount,
      priceStats.maxWithDiscount,
      priceStats.avgWithDiscount,
      priceStats.avgWithoutDiscount,
    ] : []),
  ])).filter((n) => n > 0).sort((a, b) => a - b)

  return {
    archetype: arch.kind,
    titleHint: arch.title,
    briefing: arch.briefing,
    curso: curso && { name: curso.name, nivel: curso.nivel, apiCourseName: curso.apiCourseName },
    city: city && { name: city.name, state: city.state },
    modality: arch.modality,
    offers,
    offerCount: offers.length,
    isNationalFallback,
    noOffers: offers.length === 0,
    priceStats,
    allowedPrices,
    topInstitutions,
  }
}

// ============================================================
// CLAUDE CALL
// ============================================================

type GeneratedPost = {
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  content: string
  keywords: string[]
  tags: string[]
  imageAlt: string
  readingTime: number
}

const SUBMIT_TOOL: Anthropic.Tool = {
  name: 'submit_blog_post',
  description: 'Submete o post de blog gerado, com todos os campos preenchidos conforme regras do system prompt.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Título do post (50–65 chars). Sem aspas.' },
      metaTitle: { type: 'string', description: 'Meta title HTML (50–60 chars, distinto do title).' },
      metaDescription: { type: 'string', description: 'Meta description (140–160 chars).' },
      excerpt: { type: 'string', description: 'Resumo plain text (150–220 chars), sem HTML.' },
      content: { type: 'string', description: 'HTML completo do post (1200–2500 palavras). Use h2/h3, ul/ol, table, p. Nunca h1/html/body/script.' },
      keywords: { type: 'array', items: { type: 'string' }, description: '6 a 12 keywords pt-BR.' },
      tags: { type: 'array', items: { type: 'string' }, description: '4 a 8 tags curtas.' },
      imageAlt: { type: 'string', description: 'Texto alt da imagem ideal pro post.' },
      readingTime: { type: 'integer', description: 'Tempo de leitura estimado em minutos.' },
    },
    required: ['title', 'metaTitle', 'metaDescription', 'excerpt', 'content', 'keywords', 'tags', 'imageAlt', 'readingTime'],
  },
}

async function callClaude(arch: Archetype, dataBlock: DataBlock, correction?: string): Promise<{ post: GeneratedPost; usage?: Anthropic.Usage }> {
  const userText = correction
    ? correction
    : `Gere o post para o arquétipo "${arch.kind}" com título-base "${arch.title}".\n\nDATA_BLOCK (valores literais — use APENAS estes números, especialmente "allowedPrices"):\n\`\`\`json\n${JSON.stringify(dataBlock, null, 2)}\n\`\`\`\n\nChame a tool "submit_blog_post" com os argumentos preenchidos.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    tools: [SUBMIT_TOOL],
    tool_choice: { type: 'tool', name: 'submit_blog_post' },
    messages: [{ role: 'user', content: userText }],
  })

  addCost(response.usage)
  if (totalCostUsd > HARD_COST_CAP_USD) {
    throw new Error(`Hard cost cap atingido: $${totalCostUsd.toFixed(2)} > $${HARD_COST_CAP_USD}`)
  }

  const toolBlock = response.content.find((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined
  if (!toolBlock) {
    const textBlock = response.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined
    throw new Error(`Resposta sem tool_use. Texto: ${textBlock?.text?.slice(0, 200) ?? '(vazio)'}`)
  }
  const parsed = toolBlock.input as GeneratedPost
  return { post: parsed, usage: response.usage }
}

// ============================================================
// VALIDAÇÃO
// ============================================================

function extractPrices(content: string): string[] {
  const matches = content.match(/R\$\s*[\d.]+(?:,\d{2})?/g) ?? []
  return matches.map((m) => m.replace(/\s+/g, ' ').trim())
}

function priceExistsInDataBlock(price: string, dataBlock: DataBlock): boolean {
  // Extrai dígitos do preço gerado
  const num = parseFloat(price.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.'))
  if (!isFinite(num) || num === 0) return true // zero é OK
  const allowed = new Set<number>()
  for (const o of dataBlock.offers) {
    if (o.minPrice != null) allowed.add(Math.round(o.minPrice))
    if (o.maxPrice != null) allowed.add(Math.round(o.maxPrice))
  }
  if (dataBlock.priceStats) {
    allowed.add(dataBlock.priceStats.minWithDiscount)
    allowed.add(dataBlock.priceStats.maxWithDiscount)
    allowed.add(dataBlock.priceStats.avgWithDiscount)
    allowed.add(dataBlock.priceStats.avgWithoutDiscount)
  }
  const rounded = Math.round(num)
  // tolerância de 5% pra arredondamentos editoriais ("cerca de R$ 300")
  for (const v of allowed) {
    if (Math.abs(rounded - v) / Math.max(v, 1) <= 0.05) return true
  }
  return false
}

function validatePost(post: GeneratedPost, _arch: Archetype, dataBlock: DataBlock): { ok: true } | { ok: false; reason: string } {
  // Required fields
  for (const f of ['title', 'metaTitle', 'metaDescription', 'excerpt', 'content', 'imageAlt'] as const) {
    if (!post[f] || typeof post[f] !== 'string' || !post[f].trim()) {
      return { ok: false, reason: `Campo obrigatório vazio: ${f}` }
    }
  }
  if (!Array.isArray(post.keywords) || post.keywords.length < 4) return { ok: false, reason: 'keywords ausentes ou < 4' }
  if (!Array.isArray(post.tags) || post.tags.length < 3) return { ok: false, reason: 'tags ausentes ou < 3' }

  const content = post.content

  // HTML básico
  if (/<h1[\s>]/i.test(content)) return { ok: false, reason: 'content contém <h1>' }
  if (/<html[\s>]|<body[\s>]|<head[\s>]|<script[\s>]/i.test(content)) return { ok: false, reason: 'content contém tags proibidas' }
  const h2Count = (content.match(/<h2[\s>]/gi) ?? []).length
  if (h2Count < 3) return { ok: false, reason: `content tem só ${h2Count} <h2> (mínimo 3)` }
  if (!/<(ul|ol)[\s>]/i.test(content)) return { ok: false, reason: 'content sem <ul>/<ol>' }
  // Tags balanceadas básico (h2, h3, p, ul, ol, li, strong)
  for (const tag of ['h2', 'h3', 'ul', 'ol', 'p']) {
    const open = (content.match(new RegExp(`<${tag}[\\s>]`, 'gi')) ?? []).length
    const close = (content.match(new RegExp(`</${tag}>`, 'gi')) ?? []).length
    if (open !== close) return { ok: false, reason: `tags <${tag}> desbalanceadas (${open} abre / ${close} fecha)` }
  }

  // Anti-concorrente
  for (const rx of FORBIDDEN_BRANDS) {
    if (rx.test(content) || rx.test(post.title) || rx.test(post.excerpt)) {
      return { ok: false, reason: `Menção a concorrente proibido: ${rx.source}` }
    }
  }

  // Anti-hallucination de preço
  const prices = extractPrices(content)
  for (const p of prices) {
    if (!priceExistsInDataBlock(p, dataBlock)) {
      return { ok: false, reason: `Preço ${p} não existe no DATA_BLOCK (possível hallucination)` }
    }
  }

  // Word count
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = plain.split(' ').filter(Boolean).length
  if (wordCount < 900) return { ok: false, reason: `content curto (${wordCount} palavras; mín 900)` }
  if (wordCount > 3000) return { ok: false, reason: `content longo demais (${wordCount} palavras; máx 3000)` }

  // Direct-answer opening (regra editorial GEO): primeiro parágrafo precisa
  // responder a query, não contextualizar. AI Overviews / ChatGPT / Perplexity
  // extraem o primeiro bloco semântico — contextualização antes da resposta
  // perde citações.
  const firstParagraphMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (firstParagraphMatch) {
    const firstParaText = firstParagraphMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const opening = firstParaText.split(' ').slice(0, 12).join(' ').toLowerCase()
    const contextualizingLeads = [
      /^antes de/,
      /^é importante/,
      /^é fundamental/,
      /^é essencial/,
      /^para quem/,
      /^quando se trata/,
      /^vale (lembrar|ressaltar|destacar)/,
      /^muit[ao]s (estudantes|pessoas|brasileiros)/,
      /^se você (está|quer|pensa|deseja|busca)/,
      /^atualmente/,
      /^nos últimos anos/,
      /^cada vez mais/,
      /^o ensino (a distância|superior) (consolidou|tem se tornado|vem ganhando)/,
    ]
    for (const rx of contextualizingLeads) {
      if (rx.test(opening)) {
        return { ok: false, reason: `abertura contextualizadora (viola regra GEO de resposta direta): "${opening}..."` }
      }
    }
  }

  return { ok: true }
}

function recalcReadingTime(content: string): number {
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = plain.split(' ').filter(Boolean).length
  return Math.max(3, Math.round(words / 220))
}

// ============================================================
// SEED CATEGORIAS
// ============================================================

async function seedCategories() {
  console.log('\n━━━ Categorias do blog ━━━')
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] pularia upsert de ${CATEGORIES.length} categorias`)
    return
  }
  for (const cat of CATEGORIES) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug, title: cat.title, description: cat.description, order: cat.order,
        isActive: true, metaTitle: cat.metaTitle, metaDescription: cat.metaDescription,
      },
      update: {
        title: cat.title, description: cat.description, order: cat.order, isActive: true,
        metaTitle: cat.metaTitle, metaDescription: cat.metaDescription,
      },
    })
  }
  console.log(`  ✓ ${CATEGORIES.length} categorias upsertadas`)
}

// ============================================================
// UPSERT POST
// ============================================================

async function upsertPost(
  arch: Archetype,
  post: GeneratedPost,
  existing: { publishedAt: Date | null } | null,
) {
  const readingTime = recalcReadingTime(post.content)
  const baseData = {
    title: post.title.slice(0, 200),
    excerpt: post.excerpt.slice(0, 280),
    content: post.content,
    metaTitle: post.metaTitle.slice(0, 200),
    metaDescription: post.metaDescription.slice(0, 200),
    keywords: post.keywords.slice(0, 20),
    featuredImage: imageForArchetype(arch),
    imageAlt: post.imageAlt.slice(0, 220),
    readingTime,
    tags: post.tags.slice(0, 12),
    isActive: true,
    featured: arch.featured ?? false,
  }

  if (DRY_RUN) {
    console.log(`  [DRY-RUN] upsert ${arch.slug}:`, JSON.stringify({
      ...baseData,
      content: baseData.content.slice(0, 200) + '… [' + readingTime + 'min, ' + baseData.content.length + ' chars]',
    }, null, 2))
    return
  }

  await prisma.blogPost.upsert({
    where: { slug: arch.slug },
    create: {
      ...baseData,
      slug: arch.slug,
      author: 'Equipe Bolsa Click',
      publishedAt: new Date(),
      categories: { connect: arch.categorySlugs.map((s) => ({ slug: s })) },
    },
    update: {
      ...baseData,
      publishedAt: existing?.publishedAt ?? new Date(),
      categories: { set: arch.categorySlugs.map((s) => ({ slug: s })) },
    },
  })
}

// ============================================================
// PIPELINE POR ARQUÉTIPO
// ============================================================

type RunResult =
  | { ok: true; slug: string; reason?: string; indexNowUrl?: string }
  | { ok: false; slug: string; reason?: string }

async function runOne(arch: Archetype, mecMap: Record<string, number>, idx: number, total: number): Promise<RunResult> {
  const label = `[${idx + 1}/${total}] ${arch.slug}`
  try {
    // Early-exit: economiza tokens da Claude + tempo de buildDataBlock quando
    // o post já existe e não há --force. Sem isso o script gastava ~$0.08 e
    // ~90s por skip antes do upsert detectar a duplicação.
    const existing = await prisma.blogPost.findUnique({
      where: { slug: arch.slug },
      select: { id: true, publishedAt: true },
    })
    if (existing && !FORCE && !DRY_RUN) {
      console.log(`${label} ⏭  já existe (use --force pra sobrescrever)`)
      return { ok: true, slug: arch.slug }
    }

    console.log(`${label} — build data block…`)
    const dataBlock = await buildDataBlock(arch, mecMap)
    if (dataBlock.noOffers && (arch.kind === 'curso_cidade' || arch.kind === 'curso')) {
      console.warn(`${label} ⚠️  sem ofertas reais (nem fallback nacional). Skip.`)
      return { ok: false, slug: arch.slug, reason: 'no_offers' }
    }

    console.log(`${label} — gerando (${dataBlock.offerCount} ofertas, nacional_fb=${dataBlock.isNationalFallback})…`)
    let { post } = await callClaude(arch, dataBlock)
    let validation = validatePost(post, arch, dataBlock)

    if (!validation.ok) {
      console.warn(`${label} ⚠️  validação falhou: ${validation.reason}. Retry 1x.`)
      const correction = `Sua resposta anterior falhou em: "${validation.reason}". Reenvie APENAS o JSON corrigido. DATA_BLOCK era:\n\`\`\`json\n${JSON.stringify(dataBlock, null, 2)}\n\`\`\``
      const retry = await callClaude(arch, dataBlock, correction)
      post = retry.post
      validation = validatePost(post, arch, dataBlock)
      if (!validation.ok) {
        console.error(`${label} ✗ validação 2x falhou: ${validation.reason}`)
        return { ok: false, slug: arch.slug, reason: validation.reason }
      }
    }

    await upsertPost(arch, post, existing)
    console.log(`${label} ✓ ($${totalCostUsd.toFixed(3)} acumulado)`)
    return { ok: true, slug: arch.slug, indexNowUrl: `https://www.bolsaclick.com.br/blog/${arch.slug}` }
  } catch (err) {
    const msg = (err as Error).message
    console.error(`${label} ✗ ${msg}`)
    return { ok: false, slug: arch.slug, reason: msg }
  }
}

async function pMap<T, R>(items: T[], fn: (item: T, idx: number) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

// ============================================================
// MAIN
// ============================================================

async function updateImagesOnly() {
  console.log('\n━━━ Atualizando featuredImage dos posts existentes ━━━')
  let count = 0
  for (const arch of ARCHETYPES) {
    const image = imageForArchetype(arch)
    const existing = await prisma.blogPost.findUnique({ where: { slug: arch.slug }, select: { id: true, featuredImage: true } })
    if (!existing) continue
    if (existing.featuredImage === image) continue
    await prisma.blogPost.update({
      where: { slug: arch.slug },
      data: { featuredImage: image, featured: arch.featured ?? undefined },
    })
    count++
    console.log(`  ✓ ${arch.slug} → ${image}`)
  }
  console.log(`Atualizados: ${count}`)
}

async function main() {
  console.log('=== seed-blog-posts ===')
  console.log({ MODEL, DRY_RUN, SINGLE_SLUG, LIMIT, FORCE, UPDATE_IMAGES_ONLY, CONCURRENCY })

  if (UPDATE_IMAGES_ONLY) {
    await updateImagesOnly()
    await prisma.$disconnect()
    return
  }

  await seedCategories()

  let pool = ARCHETYPES
  if (SINGLE_SLUG) {
    pool = ARCHETYPES.filter((a) => a.slug === SINGLE_SLUG)
    if (pool.length === 0) {
      console.error(`Slug não encontrado: ${SINGLE_SLUG}`)
      console.error(`Disponíveis:\n  ${ARCHETYPES.map((a) => a.slug).join('\n  ')}`)
      process.exit(1)
    }
  }
  if (LIMIT > 0) pool = pool.slice(0, LIMIT)

  console.log(`\n━━━ ${pool.length} posts ━━━`)
  console.log(`Carregando MEC ratings…`)
  const mecMap = await loadMecRatings()
  console.log(`  ${Object.keys(mecMap).length} chaves de MEC ratings`)

  const start = Date.now()
  const results = await pMap(pool, (arch, i) => runOne(arch, mecMap, i, pool.length), CONCURRENCY)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  const ok = results.filter((r) => r.ok).length
  const fail = results.length - ok
  console.log(`\n=== RESUMO ===`)
  console.log(`✓ Sucessos: ${ok}`)
  console.log(`✗ Falhas: ${fail}`)
  console.log(`⏱  Tempo: ${elapsed}s`)
  console.log(`💰 Custo: $${totalCostUsd.toFixed(3)}`)

  if (fail > 0) {
    console.log('\nFalhas:')
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.slug}: ${r.reason}`))
  }

  // Ping IndexNow pros URLs que foram realmente persistidos (não skip nem fail).
  // Dispara reindex instantâneo em Bing/Yandex/Seznam + alimenta AI Overviews
  // crawlers + ChatGPT Search. Sem custo, sem rate-limit pra volumes < 10k/dia.
  const indexNowUrls = results
    .filter((r): r is { ok: true; slug: string; indexNowUrl: string } =>
      r.ok && 'indexNowUrl' in r && typeof r.indexNowUrl === 'string',
    )
    .map((r) => r.indexNowUrl)
  if (indexNowUrls.length > 0 && !DRY_RUN) {
    console.log(`\n🔔 Ping IndexNow (${indexNowUrls.length} URLs)…`)
    const { pingIndexNow } = await import('../app/lib/seo/indexnow')
    const indexResult = await pingIndexNow(indexNowUrls)
    if (indexResult.ok) {
      console.log(`  ✓ IndexNow aceito (HTTP ${indexResult.status}, ${indexResult.urls} URLs)`)
    } else {
      console.warn(`  ⚠️  IndexNow falhou (HTTP ${indexResult.status}, ${indexResult.reason ?? 'sem detalhe'})`)
    }
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('Fatal:', err)
  prisma.$disconnect()
  process.exit(1)
})
