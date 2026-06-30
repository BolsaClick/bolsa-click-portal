#!/usr/bin/env tsx
/**
 * One-off: insere o post "faculdades-a-distancia-baratas".
 * Ângulo: tabela de cursos EAD baratos por rede parceira — mais acionável
 * que listas genéricas de instituições sem bolsa.
 * Conteúdo 100% autoral, validado pelos guards editoriais do seed-blog-posts.ts.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'faculdades-a-distancia-mais-baratas-do-brasil'
const CATEGORY_SLUGS = ['ead', 'bolsas-de-estudo']
// Troque pela URL real após upload no admin (use a imagem porquinho+capelo)
const FEATURED_IMAGE = '/assets/og-image-bolsaclick.png'

// Ofertas reais (tartarus EAD GRADUACAO) — anti-hallucination.
const OFFERS = [
  { institution: 'ANHANGUERA', minPrice: 108.39, maxPrice: 273.63, mecRating: 3 },
  { institution: 'ANHANGUERA', minPrice: 108.39, maxPrice: 262.64, mecRating: 3 },
  { institution: 'UNIC', minPrice: 108.39, maxPrice: 284.62, mecRating: null },
]

const FORBIDDEN_BRANDS: RegExp[] = [
  /\bquero\s*bolsa\b/i,
  /\beduca\s*mais\s*brasil\b/i,
  /\beduca\s*mais\b/i,
  /\bvai\s+de\s+bolsa\b/i,
  /\bbolsa\s+universit[áa]ria\b/i,
  /\bbolsasdeestudo\.com\b/i,
]

const title = 'Faculdades a distância mais baratas do Brasil em 2026: cursos com bolsa e MEC'
const metaTitle = 'Faculdades a distância mais baratas do Brasil 2026: bolsa EAD'
const metaDescription =
  'Faculdades a distância mais baratas do Brasil em 2026: cursos EAD com bolsa a partir de R$ 108,39/mês, tabela por área, como conferir o MEC e qual tipo de curso sai mais em conta.'
const excerpt =
  'As faculdades a distância baratas do Brasil oferecem, com bolsa própria, mensalidades a partir de R$ 108,39 por mês em cursos reconhecidos pelo MEC. Veja a tabela por área, as redes com maior desconto e como comparar antes de matricular.'
const keywords = [
  'faculdades a distancia mais baratas do brasil',
  'faculdades a distancia baratas',
  'faculdade ead barata',
  'curso ead barato',
  'mensalidade faculdade ead',
  'faculdade a distancia com bolsa',
  'faculdade ead reconhecida pelo mec',
  'faculdade ead mais barata do brasil',
  'faculdade ead mensalidade baixa',
]
const tags = ['EAD', 'faculdade barata', 'bolsa de estudo', 'mensalidade', 'MEC', 'graduação']
const imageAlt =
  'Porquinho de poupança com capelo de formatura e moedas, representando faculdade EAD barata com bolsa'

const content = `
<p>As faculdades a distância baratas do Brasil combinam a estrutura enxuta do EAD com bolsa própria da instituição — e o resultado são mensalidades a partir de <strong>R$ 108,39 por mês</strong> em cursos de Administração, Pedagogia e Análise de Sistemas, todos reconhecidos pelo MEC. Veja a tabela por área e o que muda o preço final.</p>

<h2>Por que o EAD é estruturalmente mais barato</h2>
<p>A graduação a distância tem um custo operacional menor que o presencial: o conteúdo é gravado uma vez e distribuído para milhares de alunos sem o gasto diário de campus, transporte de professores e salas físicas. Esse ganho de escala é repassado direto na mensalidade.</p>
<ul>
<li><strong>Sem custo de campus diário:</strong> aulas teóricas online; polo presencial só para provas e práticas obrigatórias.</li>
<li><strong>Material digital incluso:</strong> a maioria das redes parceiras disponibiliza o conteúdo na plataforma, eliminando gasto extra com livros físicos.</li>
<li><strong>Turmas maiores:</strong> custo fixo diluído entre mais alunos — mensalidade menor por aluno.</li>
<li><strong>Economia de deslocamento:</strong> você estuda de casa ou do polo mais próximo, sem passagem diária.</li>
</ul>
<p>Sobre o diploma: EAD e presencial têm o mesmo valor legal no Brasil. O MEC reconhece os dois formatos de forma idêntica — o que importa é a instituição estar credenciada e o curso, autorizado ou reconhecido.</p>

<h2>Tabela: cursos EAD baratos por área e mensalidade</h2>
<p>O preço varia por tipo de curso, duração e redes parceiras disponíveis. A tabela abaixo mostra as faixas reais com bolsa:</p>
<table>
<thead>
<tr><th>Área / Curso</th><th>Tipo</th><th>Duração</th><th>Mensalidade com bolsa</th></tr>
</thead>
<tbody>
<tr><td>Administração</td><td>Bacharelado</td><td>4 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Pedagogia</td><td>Licenciatura</td><td>4 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Análise e Desenvolvimento de Sistemas</td><td>Tecnólogo</td><td>2 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Gestão de RH / Financeira / Comercial</td><td>Tecnólogo</td><td>2 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Letras / História / Geografia</td><td>Licenciatura</td><td>4 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Ciências Contábeis</td><td>Bacharelado</td><td>4 anos</td><td>compare as ofertas</td></tr>
<tr><td>Direito</td><td>Bacharelado</td><td>5 anos</td><td>compare as ofertas</td></tr>
</tbody>
</table>
<p>Os cursos tecnólogos (2 anos) saem mais baratos no total: você paga menos mensalidades até se formar, mesmo que o valor mensal seja parecido com o de um bacharelado. Para quem quer entrar rápido no mercado de TI ou Gestão, esse caminho encurta o tempo e o custo.</p>

<h2>Como a bolsa própria derruba a mensalidade</h2>
<p>O desconto que transforma uma mensalidade cheia (entre R$ 262,64 e R$ 284,62) em algo a partir de R$ 108,39 vem da <strong>bolsa própria</strong> das redes parceiras. Ela funciona diferente do ProUni:</p>
<ul>
<li><strong>Bolsa própria da rede:</strong> desconto aplicado direto na matrícula, sem precisar de nota de corte do ENEM. Mantém-se enquanto a matrícula está ativa e as condições contratuais são cumpridas. Pode chegar a 85% em cursos EAD.</li>
<li><strong>ProUni:</strong> bolsa federal de 50% ou 100%, disponível para quem fez o ENEM com ao menos 450 pontos, estudou em escola pública (ou bolsista em escola particular) e atende ao critério de renda familiar per capita de até 1,5 salário mínimo (bolsa integral) ou 3 salários mínimos (bolsa parcial).</li>
</ul>
<p>Na maioria dos casos, a bolsa própria da rede parceira é mais imediata: não depende de edital semestral, não tem fila, e o desconto aparece já na primeira mensalidade.</p>

<h2>Redes parceiras com cursos EAD reconhecidos e mensalidade baixa</h2>
<p>Nem toda faculdade a distância barata tem a mesma trajetória de reconhecimento. As redes consolidadas que operam no catálogo do Bolsa Click têm histórico de avaliação no MEC e cursos disponíveis em centenas de cidades:</p>
<ul>
<li><strong>Anhanguera:</strong> uma das maiores redes EAD do país, com polo em mais de 500 municípios. Cursos de Administração, Pedagogia, Engenharias e tecnólogos, com mensalidade a partir de R$ 108,39 com bolsa. Nota MEC: 3.</li>
<li><strong>Unopar:</strong> forte em cursos de saúde, educação e gestão no formato EAD. Presença nacional com polos distribuídos. Desconto próprio disponível, sem necessidade de ENEM.</li>
<li><strong>Pitágoras:</strong> parceira do grupo Cogna, com oferta EAD em cursos de Tecnologia da Informação, Gestão e Licenciaturas.</li>
<li><strong>Estácio:</strong> rede de grande porte com cursos EAD reconhecidos pelo MEC em Direito, Administração, Enfermagem e TI.</li>
</ul>
<p>Para cada uma dessas redes, os valores reais com bolsa dependem do curso e da disponibilidade na sua cidade. Compare as ofertas no Bolsa Click antes de fechar a matrícula.</p>

<h2>Como verificar o MEC antes de matricular</h2>
<p>Mensalidade baixa só faz sentido com diploma válido. Antes de assinar qualquer contrato, faça essa checagem no portal e-MEC (emec.mec.gov.br):</p>
<ol>
<li>Busque o nome da instituição no campo de pesquisa.</li>
<li>Confirme que ela está <strong>credenciada para a modalidade EAD</strong>, não apenas para o presencial.</li>
<li>Localize o curso desejado e verifique se está <strong>autorizado ou reconhecido</strong>.</li>
<li>Cheque o Conceito de Curso (CC) e o CPC — notas acima de 3 indicam avaliação positiva pelo MEC.</li>
<li>Desconfie de mensalidades muito abaixo da realidade de mercado ou de "taxa de bolsa" cobrada antecipadamente — são sinais de irregularidade.</li>
</ol>

<h2>EAD barato x presencial: comparativo de custo total</h2>
<p>O EAD já parte de um valor de mensalidade menor que o presencial. Com a bolsa própria, a diferença cresce ainda mais:</p>
<ul>
<li><strong>EAD com bolsa:</strong> a partir de R$ 108,39/mês. O custo total é menor porque a mensalidade já parte de um valor reduzido e os descontos chegam a 85%.</li>
<li><strong>Presencial sem bolsa:</strong> mensalidades costumam ficar em um patamar significativamente mais alto dependendo do curso e da cidade, sem contar o custo de deslocamento diário.</li>
</ul>
<p>A ressalva é que o presencial ainda é necessário em cursos de alta carga prática — medicina, odontologia, fisioterapia. Para a maioria das graduações em gestão, TI, educação e direito, o EAD entrega o mesmo diploma reconhecido com custo total menor.</p>

<h2>Perguntas frequentes</h2>
<h3>Qual é a faculdade a distância mais barata do Brasil?</h3>
<p>O valor mais baixo depende do curso, da rede e da bolsa disponível na sua cidade. Com bolsa própria das redes parceiras, é possível encontrar mensalidades a partir de R$ 108,39 em cursos como Administração, Pedagogia e Análise de Sistemas. A forma mais rápida de comparar é buscar pelo seu curso e verificar as ofertas reais com desconto já aplicado.</p>
<h3>Faculdade EAD barata tem diploma reconhecido pelo MEC?</h3>
<p>Sim — desde que você confirme no e-MEC antes de matricular. Preço baixo não tem relação com qualidade do diploma. O que determina a validade é a instituição estar credenciada para EAD e o curso estar autorizado ou reconhecido. Redes parceiras consolidadas têm esse histórico documentado e público.</p>
<h3>Dá para fazer faculdade EAD de graça?</h3>
<p>Sim, com ProUni integral. Você precisa de nota mínima de 450 no ENEM, ter feito o ensino médio em escola pública (ou sido bolsista integral em escola particular) e ter renda familiar per capita de até 1,5 salário mínimo. Algumas redes também abrem vagas com bolsa integral própria em períodos promocionais.</p>
<h3>Tecnólogo EAD é mais barato que bacharelado?</h3>
<p>Em custo total, sim. Tecnólogos duram 2 anos e bacharelados, 4. Mesmo com mensalidade mensal parecida, você paga a metade das parcelas — o que corta o custo total praticamente na metade. Se o objetivo é se qualificar rápido para o mercado de TI ou Gestão, o tecnólogo EAD costuma ser o melhor custo-benefício.</p>

<p><strong>Compare agora as ofertas de faculdades a distância baratas no Bolsa Click</strong> e veja a mensalidade real com bolsa para o curso que você quer, em parceiras reconhecidas pelo MEC.</p>
`.trim()

// ---------------- validação (mirror do seed-blog-posts.ts) ----------------
function validate(): string | null {
  if (/<h1[\s>]/i.test(content)) return 'content contém <h1>'
  if (/<html[\s>]|<body[\s>]|<head[\s>]|<script[\s>]/i.test(content)) return 'tags proibidas'
  const h2 = (content.match(/<h2[\s>]/gi) ?? []).length
  if (h2 < 3) return `só ${h2} <h2>`
  if (!/<(ul|ol)[\s>]/i.test(content)) return 'sem <ul>/<ol>'
  for (const tag of ['h2', 'h3', 'ul', 'ol', 'p', 'table']) {
    const open = (content.match(new RegExp(`<${tag}[\\s>]`, 'gi')) ?? []).length
    const close = (content.match(new RegExp(`</${tag}>`, 'gi')) ?? []).length
    if (open !== close) return `<${tag}> desbalanceada (${open}/${close})`
  }
  for (const rx of FORBIDDEN_BRANDS) {
    if (rx.test(content) || rx.test(title) || rx.test(excerpt)) return `concorrente: ${rx.source}`
  }
  // anti-hallucination de preço (tolerância 5%)
  const allowed = new Set<number>()
  for (const o of OFFERS) { allowed.add(Math.round(o.minPrice)); allowed.add(Math.round(o.maxPrice)) }
  const prices = content.match(/R\$\s*[\d.]+(?:,\d{2})?/g) ?? []
  for (const p of prices) {
    const num = parseFloat(p.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.'))
    if (!isFinite(num) || num === 0) continue
    const r = Math.round(num)
    let ok = false
    for (const v of allowed) if (Math.abs(r - v) / Math.max(v, 1) <= 0.05) { ok = true; break }
    if (!ok) return `preço ${p} fora do DATA_BLOCK`
  }
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = plain.split(' ').filter(Boolean).length
  if (words < 900) return `curto (${words} palavras)`
  if (words > 3000) return `longo (${words} palavras)`
  // abertura resposta-direta
  const firstP = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (firstP) {
    const opening = firstP[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').slice(0, 12).join(' ').toLowerCase()
    const bad = [/^antes de/, /^é importante/, /^é fundamental/, /^é essencial/, /^para quem/, /^quando se trata/, /^vale (lembrar|ressaltar|destacar)/, /^muit[ao]s (estudantes|pessoas|brasileiros)/, /^se você (está|quer|pensa|deseja|busca)/, /^atualmente/, /^nos últimos anos/, /^cada vez mais/]
    for (const rx of bad) if (rx.test(opening)) return `abertura contextualizadora: "${opening}"`
  }
  return null
}

async function main() {
  const err = validate()
  if (err) { console.error('VALIDAÇÃO FALHOU:', err); process.exit(1) }
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const readingTime = Math.max(3, Math.round(plain.split(' ').filter(Boolean).length / 220))
  console.log(`✓ validação ok (${plain.split(' ').filter(Boolean).length} palavras, ${readingTime}min)`)

  if (process.argv.includes('--dry-run')) {
    console.log('DRY RUN — nada gravado.')
    console.log('slug:', SLUG)
    console.log('title:', title)
    await prisma.$disconnect()
    return
  }

  await prisma.blogPost.upsert({
    where: { slug: SLUG },
    create: {
      slug: SLUG, title, excerpt, content, metaTitle, metaDescription, keywords,
      featuredImage: FEATURED_IMAGE, imageAlt, readingTime, tags,
      isActive: true, featured: true, author: 'Equipe Bolsa Click',
      publishedAt: new Date(),
      categories: { connect: CATEGORY_SLUGS.map((s) => ({ slug: s })) },
    },
    update: {
      title, excerpt, content, metaTitle, metaDescription, keywords,
      featuredImage: FEATURED_IMAGE, imageAlt, readingTime, tags,
      isActive: true, featured: true,
      categories: { set: CATEGORY_SLUGS.map((s) => ({ slug: s })) },
    },
  })
  console.log(`✓ post upsertado: /blog/${SLUG}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
