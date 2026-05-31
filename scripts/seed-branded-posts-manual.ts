#!/usr/bin/env tsx
/**
 * scripts/seed-branded-posts-manual.ts
 *
 * Posts de blog de MARCA (parceiros) com conteúdo redigido à mão — SEM chamar a
 * API da Anthropic (alternativa ao seed-blog-posts.ts quando não há crédito).
 * Mesmas regras do CLAUDE.md: 100% original, abertura GEO (resposta direta nos
 * primeiros 40-60 palavras), sem citar concorrentes agregadores, SEM preço em R$
 * inventado (qualitativo + link pra /faculdades/anhanguera pros valores reais).
 * Anhanguera é parceira (whitelist) — pode citar por nome.
 *
 * USO:
 *   node --env-file=.env --import tsx scripts/seed-branded-posts-manual.ts --dry-run
 *   node --env-file=.env --import tsx scripts/seed-branded-posts-manual.ts            # grava no DB
 */

import { PrismaClient } from '@prisma/client'

const DRY_RUN = process.argv.includes('--dry-run')
const DEFAULT_IMAGE = '/assets/og-image-bolsaclick.png'
const prisma = new PrismaClient()

function readingTime(content: string): number {
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return Math.max(3, Math.round(plain.split(' ').filter(Boolean).length / 220))
}

type Post = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  keywords: string[]
  tags: string[]
  imageAlt: string
  categorySlugs: string[]
  featured?: boolean
  content: string
}

const POSTS: Post[] = [
  {
    slug: 'anhanguera-ead-como-conseguir-bolsa',
    title: 'Anhanguera EAD: como conseguir bolsa de estudo em 2026',
    metaTitle: 'Anhanguera EAD: como conseguir bolsa de estudo em 2026',
    metaDescription:
      'Como conseguir bolsa de estudo na Anhanguera EAD: busque o curso, compare as ofertas e inscreva-se grátis. Descontos de até 80% sem nota de corte, em cursos reconhecidos pelo MEC.',
    excerpt:
      'O passo a passo pra garantir bolsa de até 80% na Anhanguera EAD em 2026 — sem nota de corte, com inscrição gratuita e diploma reconhecido pelo MEC.',
    keywords: [
      'anhanguera ead', 'bolsa anhanguera', 'bolsa de estudo anhanguera', 'anhanguera ead bolsa',
      'anhanguera ead como funciona', 'faculdade anhanguera ead', 'anhanguera desconto', 'anhanguera mensalidade',
    ],
    tags: ['Anhanguera', 'EAD', 'Bolsa de estudo'],
    imageAlt: 'Estudante assistindo aula online de um curso EAD da Anhanguera com bolsa de estudo',
    categorySlugs: ['ead', 'bolsas-de-estudo'],
    featured: true,
    content: `
<p>Para conseguir bolsa de estudo na <strong>Anhanguera EAD</strong>, o caminho mais rápido é buscar o curso aqui no Bolsa Click, comparar as ofertas das unidades e polos e se inscrever gratuitamente — os descontos chegam a <strong>até 80%</strong> na mensalidade, sem nota de corte, em cursos reconhecidos pelo MEC. <a href="/faculdades/anhanguera">Veja as bolsas de estudo na Anhanguera</a> e garanta a sua.</p>

<h2>Como funciona a bolsa na Anhanguera EAD</h2>
<p>A Anhanguera é uma das maiores redes de ensino superior privado do Brasil, com ampla presença em ensino a distância. As bolsas oferecidas via Bolsa Click são <strong>bolsas próprias da faculdade</strong> — diferentes do ProUni e do FIES, que são programas federais. Na prática, isso significa três vantagens pra quem quer estudar EAD:</p>
<ul>
  <li><strong>Sem nota de corte:</strong> você não disputa vaga por pontuação de ENEM.</li>
  <li><strong>Sem critério de renda:</strong> a bolsa não depende de comprovação de renda familiar.</li>
  <li><strong>Inscrição o ano todo:</strong> não há janela fechada como nas edições do ProUni.</li>
</ul>
<p>O desconto é aplicado já na primeira mensalidade e vale durante todo o curso, enquanto você mantém a matrícula ativa e a aprovação acadêmica.</p>

<h2>Passo a passo pra garantir sua bolsa</h2>
<ol>
  <li><strong>Busque o curso</strong> que você quer fazer (Pedagogia, Administração, Análise e Desenvolvimento de Sistemas, Gestão de RH e muitos outros têm oferta EAD).</li>
  <li><strong>Compare as ofertas</strong> das unidades e polos da Anhanguera e veja o percentual de desconto disponível antes de decidir.</li>
  <li><strong>Faça a inscrição gratuita</strong> e conclua a matrícula direto com a instituição.</li>
  <li><strong>Pague a mensalidade já com a bolsa</strong> — o pagamento é feito à faculdade, nunca ao Bolsa Click.</li>
</ol>
<p>Quer entender todas as modalidades de desconto antes? Veja o <a href="/bolsas-de-estudo">guia completo de bolsas de estudo</a>.</p>

<h2>Quais cursos da Anhanguera têm bolsa em EAD</h2>
<p>A modalidade a distância costuma concentrar os maiores percentuais de desconto, porque a mensalidade-base do EAD já parte de um valor menor que o presencial. Cursos teóricos como Pedagogia, Administração, Ciências Contábeis, Gestão de Recursos Humanos, Marketing e Análise e Desenvolvimento de Sistemas estão entre os mais procurados em EAD. Cursos com forte carga prática (como Enfermagem) seguem o modelo semipresencial, com encontros e estágios presenciais em polos credenciados, conforme exigência do MEC.</p>

<h2>EAD da Anhanguera é reconhecido pelo MEC?</h2>
<p>Sim. A Anhanguera é uma instituição reconhecida pelo Ministério da Educação, e o diploma de um curso EAD tem a mesma validade de um curso presencial. Ainda assim, o cuidado vale sempre: antes de matricular, confirme o reconhecimento do <strong>curso específico</strong> e a nota da instituição diretamente no portal oficial <a href="https://emec.mec.gov.br" rel="nofollow noopener" target="_blank">e-MEC</a>. Barato e flexível não pode significar não reconhecido — e, no caso da Anhanguera, você tem as duas coisas.</p>

<h2>Perguntas frequentes</h2>
<h3>Preciso de ENEM pra conseguir bolsa na Anhanguera EAD?</h3>
<p>Não. A bolsa própria da Anhanguera via Bolsa Click aceita o processo seletivo da própria faculdade (geralmente uma redação online), sem exigir nota do ENEM.</p>
<h3>De quanto é o desconto?</h3>
<p>Os descontos nas mensalidades chegam a até 80%, variando por curso, modalidade e unidade. Veja o valor real de cada oferta na <a href="/faculdades/anhanguera">página da Anhanguera</a>.</p>
<h3>A bolsa vale durante todo o curso?</h3>
<p>Sim. O desconto acompanha você do primeiro ao último semestre, enquanto a matrícula estiver ativa e você mantiver a aprovação acadêmica.</p>
<h3>O diploma EAD vale o mesmo que o presencial?</h3>
<p>Sim. Para o MEC, o diploma de um curso a distância reconhecido tem exatamente a mesma validade do presencial.</p>
`.trim(),
  },
  {
    slug: 'como-conseguir-bolsa-anhanguera-sem-enem',
    title: 'Como conseguir bolsa na Anhanguera sem ENEM',
    metaTitle: 'Como conseguir bolsa na Anhanguera sem ENEM',
    metaDescription:
      'Dá pra conseguir bolsa na Anhanguera sem nota do ENEM: use o processo seletivo próprio da faculdade (redação online), sem critério de renda. Veja o passo a passo.',
    excerpt:
      'Não fez ou não quer usar o ENEM? Veja como garantir bolsa de estudo na Anhanguera pelo processo seletivo próprio — sem nota de corte e com inscrição o ano todo.',
    keywords: [
      'bolsa anhanguera sem enem', 'anhanguera sem enem', 'como entrar na anhanguera sem enem',
      'bolsa de estudo anhanguera', 'anhanguera processo seletivo', 'anhanguera vestibular online', 'bolsa anhanguera',
    ],
    tags: ['Anhanguera', 'Sem ENEM', 'Bolsa de estudo'],
    imageAlt: 'Pessoa fazendo redação online no processo seletivo da Anhanguera para conseguir bolsa sem ENEM',
    categorySlugs: ['bolsas-de-estudo', 'ead'],
    content: `
<p>Sim, dá pra conseguir bolsa na <strong>Anhanguera sem ENEM</strong>. As bolsas próprias da faculdade — disponíveis via Bolsa Click — aceitam o <strong>processo seletivo da própria instituição</strong>, geralmente uma redação online, sem exigir nota do ENEM e sem critério de renda. <a href="/faculdades/anhanguera">Veja as bolsas de estudo na Anhanguera</a> e inscreva-se gratuitamente.</p>

<h2>Por que não precisa de ENEM</h2>
<p>O ENEM só é obrigatório nos programas <strong>federais</strong>: ProUni (bolsa) e FIES (financiamento). A bolsa própria de uma faculdade particular como a Anhanguera é negociada diretamente entre a instituição e o estudante — por isso ela pode usar o próprio vestibular como porta de entrada. Resultado: você não depende de ter feito o ENEM nem de atingir uma nota de corte.</p>
<p>Se você quer entender todos os caminhos de ingresso sem a prova, veja também o guia de <a href="/sem-enem">faculdade sem ENEM</a>.</p>

<h2>Como funciona o processo seletivo próprio</h2>
<ul>
  <li><strong>Redação online:</strong> a forma mais comum. Você escreve um texto sobre um tema proposto, no conforto de casa.</li>
  <li><strong>Sem nota mínima de corte:</strong> o objetivo é avaliar a escrita, não ranquear por pontuação.</li>
  <li><strong>Resultado rápido:</strong> em geral a aprovação sai em pouco tempo, agilizando a matrícula.</li>
</ul>
<p>Quem já fez o ENEM em qualquer edição também pode usar a nota como atalho — mas isso é uma opção, não uma exigência.</p>

<h2>Passo a passo pra garantir a bolsa sem ENEM</h2>
<ol>
  <li>Busque o curso desejado e veja as <a href="/bolsas-de-estudo">bolsas de estudo</a> disponíveis.</li>
  <li>Escolha a oferta da Anhanguera com o melhor desconto pra você.</li>
  <li>Faça o processo seletivo próprio (a redação online) e a inscrição gratuita.</li>
  <li>Conclua a matrícula e comece a pagar a mensalidade já com a bolsa aplicada.</li>
</ol>

<h2>Sem ENEM e sem comprovar renda?</h2>
<p>Isso mesmo. Ao contrário do ProUni, a bolsa própria não exige comprovação de renda familiar. Ela é uma alternativa pensada pra quem não atinge os critérios do programa federal, não fez o ENEM, ou simplesmente não quer esperar as janelas de inscrição que abrem duas vezes por ano. Antes de fechar, confirme sempre o reconhecimento do curso no <a href="https://emec.mec.gov.br" rel="nofollow noopener" target="_blank">e-MEC</a>.</p>

<h2>Perguntas frequentes</h2>
<h3>É verdade que consigo bolsa na Anhanguera sem ENEM?</h3>
<p>Sim. A bolsa própria usa o processo seletivo da faculdade (normalmente uma redação online), sem exigir ENEM.</p>
<h3>Preciso comprovar renda?</h3>
<p>Não. Diferente do ProUni, a bolsa própria da Anhanguera não tem critério de renda.</p>
<h3>Quando posso me inscrever?</h3>
<p>O ano todo. Não há janela fechada como nas edições do ProUni e do FIES.</p>
<h3>Quanto desconto eu consigo?</h3>
<p>Os descontos chegam a até 80% na mensalidade, conforme o curso e a unidade. Confira cada oferta na <a href="/faculdades/anhanguera">página da Anhanguera</a>.</p>
`.trim(),
  },
  {
    slug: 'anhanguera-vale-a-pena-mec-bolsas',
    title: 'A Anhanguera vale a pena? Nota MEC, bolsas e o que esperar',
    metaTitle: 'A Anhanguera vale a pena? Nota MEC, bolsas e o que esperar',
    metaDescription:
      'A Anhanguera vale a pena? Veja prós, pontos de atenção, como conferir a nota no MEC e as bolsas de até 80% — um panorama honesto pra decidir.',
    excerpt:
      'Um panorama honesto da Anhanguera: rede ampla, forte em EAD, diploma reconhecido pelo MEC e bolsas de até 80%. Veja os prós, os cuidados e pra quem faz sentido.',
    keywords: [
      'anhanguera vale a pena', 'anhanguera é boa', 'anhanguera nota mec', 'faculdade anhanguera',
      'bolsa de estudo anhanguera', 'anhanguera é reconhecida pelo mec', 'anhanguera ead vale a pena',
    ],
    tags: ['Anhanguera', 'MEC', 'Bolsa de estudo'],
    imageAlt: 'Estudante avaliando se a faculdade Anhanguera vale a pena, com nota do MEC e bolsa de estudo',
    categorySlugs: ['guias-mec', 'bolsas-de-estudo'],
    content: `
<p>A <strong>Anhanguera</strong> vale a pena pra quem busca uma faculdade acessível, com ampla rede de polos, forte presença em EAD, diploma reconhecido pelo MEC e bolsas de até 80% na mensalidade. Como toda instituição grande, o que mais pesa na decisão é o <strong>curso específico</strong> e a sua nota atual no MEC — que dá pra conferir em minutos. <a href="/faculdades/anhanguera">Veja as bolsas de estudo na Anhanguera</a> e compare antes de decidir.</p>

<h2>Os pontos fortes</h2>
<ul>
  <li><strong>Acessibilidade:</strong> bolsas próprias de até 80%, sem nota de corte e sem critério de renda, via Bolsa Click.</li>
  <li><strong>Alcance nacional:</strong> uma das maiores redes privadas do país, com ampla cobertura de polos e cursos EAD.</li>
  <li><strong>Flexibilidade:</strong> modalidades EAD, semipresencial e presencial, boas pra quem concilia trabalho e estudo.</li>
  <li><strong>Reconhecimento:</strong> instituição reconhecida pelo MEC, com diploma de validade nacional.</li>
</ul>

<h2>Os pontos de atenção</h2>
<p>Ser honesto também é parte de um bom panorama. Em redes grandes, a qualidade pode variar entre cursos e unidades — por isso a recomendação é sempre olhar o <strong>curso que você quer</strong>, e não só a instituição como um todo. Verifique a estrutura do polo mais próximo (laboratórios, biblioteca, suporte), a grade curricular e, no caso de cursos com prática (saúde, engenharias), como funcionam os encontros presenciais e estágios.</p>

<h2>Qual a nota da Anhanguera no MEC?</h2>
<p>A avaliação institucional e a nota de cada curso são públicas e podem mudar a cada ciclo de avaliação. Em vez de confiar em um número solto, consulte a informação <strong>atualizada</strong> na fonte oficial: o portal <a href="https://emec.mec.gov.br" rel="nofollow noopener" target="_blank">e-MEC</a> mostra o credenciamento da instituição e o reconhecimento do curso específico. É o passo que separa uma boa escolha de uma decisão no escuro — e leva poucos minutos.</p>

<h2>Pra quem a Anhanguera faz sentido</h2>
<p>Faz sentido pra quem prioriza custo-benefício e flexibilidade: estudantes que trabalham, que moram longe de grandes centros (e se beneficiam do EAD), que não fizeram o ENEM ou que não fecham os critérios do ProUni. Combinada com a bolsa própria, a Anhanguera vira uma das rotas mais econômicas pro diploma de ensino superior. Compare as opções no <a href="/bolsas-de-estudo">guia completo de bolsas de estudo</a> antes de decidir.</p>

<h2>Perguntas frequentes</h2>
<h3>A Anhanguera é reconhecida pelo MEC?</h3>
<p>Sim, é uma instituição de ensino superior reconhecida pelo Ministério da Educação. Confirme o reconhecimento do seu curso específico no e-MEC.</p>
<h3>O diploma da Anhanguera tem validade?</h3>
<p>Sim. O diploma de um curso reconhecido tem validade nacional, seja na modalidade presencial ou EAD.</p>
<h3>Dá pra estudar na Anhanguera com bolsa?</h3>
<p>Dá. Há bolsas próprias de até 80% via Bolsa Click, sem nota de corte. Veja as ofertas na <a href="/faculdades/anhanguera">página da Anhanguera</a>.</p>
<h3>EAD da Anhanguera vale a pena?</h3>
<p>Para cursos teóricos e pra quem precisa de flexibilidade, sim — o EAD reconhecido pelo MEC tem a mesma validade do presencial e costuma ter o maior desconto.</p>
`.trim(),
  },
]

async function main() {
  console.log(`seed-branded-posts-manual  dry-run=${DRY_RUN}  posts=${POSTS.length}\n`)
  for (const p of POSTS) {
    const rt = readingTime(p.content)
    const base = {
      title: p.title.slice(0, 200),
      excerpt: p.excerpt.slice(0, 280),
      content: p.content,
      metaTitle: p.metaTitle.slice(0, 200),
      metaDescription: p.metaDescription.slice(0, 200),
      keywords: p.keywords.slice(0, 20),
      featuredImage: DEFAULT_IMAGE,
      imageAlt: p.imageAlt.slice(0, 220),
      readingTime: rt,
      tags: p.tags.slice(0, 12),
      isActive: true,
      featured: p.featured ?? false,
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] ${p.slug} — ${rt}min, ${p.content.length} chars, cats=[${p.categorySlugs.join(', ')}]`)
      continue
    }
    const existing = await prisma.blogPost.findUnique({
      where: { slug: p.slug },
      select: { publishedAt: true },
    })
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        ...base,
        slug: p.slug,
        author: 'Equipe Bolsa Click',
        publishedAt: new Date(),
        categories: { connect: p.categorySlugs.map((s) => ({ slug: s })) },
      },
      update: {
        ...base,
        publishedAt: existing?.publishedAt ?? new Date(),
        categories: { set: p.categorySlugs.map((s) => ({ slug: s })) },
      },
    })
    console.log(`✓ ${p.slug} (${rt}min)`)
  }
}

main()
  .catch((e) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
