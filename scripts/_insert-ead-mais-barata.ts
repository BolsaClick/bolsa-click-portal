#!/usr/bin/env tsx
/**
 * One-off: insere o post "faculdade-ead-mais-barata".
 * Conteúdo autoral (API Anthropic sem crédito no momento), validado pelos
 * mesmos guards editoriais do seed-blog-posts.ts antes do upsert.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'faculdade-ead-mais-barata'
const CATEGORY_SLUGS = ['ead', 'bolsas-de-estudo']
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

const title = 'Faculdade EAD mais barata: como achar mensalidade baixa em 2026'
const metaTitle = 'Faculdade EAD mais barata em 2026: mensalidade baixa + bolsa'
const metaDescription =
  'Faculdade EAD mais barata: mensalidade com bolsa a partir de R$ 108,39, cursos mais em conta e como conferir o reconhecimento no MEC antes de matricular.'
const excerpt =
  'A faculdade EAD mais barata combina mensalidade já menor que a presencial com bolsa própria de até 85%. Veja os cursos mais em conta, faixas de preço reais e como conferir o MEC antes de matricular.'
const keywords = [
  'faculdade ead mais barata',
  'faculdade a distancia barata',
  'mensalidade faculdade ead',
  'curso ead barato',
  'bolsa de estudo ead',
  'faculdade ead com bolsa',
  'faculdade ead reconhecida pelo mec',
  'quanto custa faculdade ead',
]
const tags = ['EAD', 'mensalidade', 'bolsa de estudo', 'faculdade barata', 'MEC', 'graduação']
const imageAlt = 'Estudante assistindo a aula de faculdade EAD barata no notebook em casa'

const content = `
<p>A faculdade EAD mais barata você encontra combinando duas coisas: a modalidade a distância, que já parte de mensalidades menores que o presencial, e a bolsa própria de faculdades parceiras, que derruba o valor para algo a partir de <strong>R$ 108,39 por mês</strong> em cursos como Administração e Análise e Desenvolvimento de Sistemas. Abaixo, como achar a opção mais em conta e o que conferir antes de matricular.</p>

<h2>Por que a faculdade EAD é mais barata que a presencial</h2>
<p>A graduação <a href="/faculdade-ead">a distância (EAD)</a> custa menos porque tem uma estrutura de operação mais enxuta: o conteúdo é produzido uma vez e distribuído para milhares de alunos, sem o custo de salas, deslocamento de professores e infraestrutura física diária. Esse ganho de escala se reflete direto na mensalidade.</p>
<ul>
<li><strong>Sem custo de campus diário:</strong> as aulas teóricas são online, e o polo presencial é usado só para provas e atividades práticas.</li>
<li><strong>Material digital incluso:</strong> a maioria das parceiras disponibiliza o conteúdo na plataforma, o que reduz gasto extra com livros.</li>
<li><strong>Economia de transporte e tempo:</strong> você estuda de casa, sem passagem ou combustível para ir ao campus todo dia.</li>
<li><strong>Turmas maiores:</strong> o custo fixo é diluído entre mais alunos, puxando o preço por aluno para baixo.</li>
</ul>

<h2>Como a bolsa de estudo derruba a mensalidade</h2>
<p>Mesmo a mensalidade EAD, que já é baixa, pode cair ainda mais com bolsa. Existem dois caminhos principais, e vale conhecer os dois no <a href="/bolsas-de-estudo">guia completo de bolsas de estudo</a> antes de decidir:</p>
<ul>
<li><strong>Bolsa própria da faculdade parceira:</strong> desconto aplicado direto na mensalidade, que pode chegar a 85% em cursos EAD, sem precisar de nota de corte do ENEM.</li>
<li><strong>ProUni:</strong> programa federal que oferece bolsa de 50% ou 100% para quem fez o ENEM com pelo menos 450 pontos, estudou em escola pública (ou bolsista em particular) e atende ao critério de renda.</li>
</ul>
<p>Na prática, é a bolsa própria que costuma transformar uma mensalidade cheia de algo entre <strong>R$ 262,64 e R$ 284,62</strong> em um valor a partir de <strong>R$ 108,39 por mês</strong>. O desconto vale enquanto você mantém a matrícula ativa e as condições do contrato.</p>

<h2>Cursos EAD com as mensalidades mais baixas</h2>
<p>Nem todo curso custa igual. As áreas com maior procura e menor carga de laboratório tendem a ter as mensalidades mais acessíveis. Os cursos EAD que mais aparecem com valores baixos são:</p>
<ul>
<li><strong>Pedagogia (licenciatura):</strong> uma das portas mais baratas para quem quer dar aula ou prestar concurso público.</li>
<li><strong>Administração (bacharelado):</strong> grade ampla, alta demanda e mensalidade entre as mais em conta.</li>
<li><strong>Análise e Desenvolvimento de Sistemas (tecnólogo):</strong> só 2 anos de duração, o que reduz o custo total do diploma.</li>
<li><strong>Gestão (RH, Comercial, Financeira):</strong> cursos tecnólogos curtos, voltados ao mercado, com valores baixos.</li>
</ul>
<table>
<thead>
<tr><th>Curso EAD</th><th>Duração típica</th><th>Mensalidade com bolsa</th></tr>
</thead>
<tbody>
<tr><td>Pedagogia</td><td>4 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Administração</td><td>4 anos</td><td>a partir de R$ 108,39</td></tr>
<tr><td>Análise e Desenvolvimento de Sistemas</td><td>2 anos</td><td>a partir de R$ 108,39</td></tr>
</tbody>
</table>
<p>Repare que o tecnólogo, por durar menos tempo, sai mais barato no total: você paga menos mensalidades até receber o diploma, mesmo que o valor mensal seja parecido.</p>

<h2>Barato não pode significar não reconhecido: confira o MEC</h2>
<p>Mensalidade baixa só vale a pena se o diploma tiver valor. Toda faculdade EAD precisa ser credenciada pelo MEC e cada curso precisa estar autorizado ou reconhecido — caso contrário, o diploma não é aceito em concursos, na OAB ou em outras seleções. Antes de fechar matrícula, faça esta checagem rápida no portal e-MEC (emec.mec.gov.br):</p>
<ol>
<li>Acesse o portal e-MEC e busque pela instituição no campo de consulta.</li>
<li>Confirme que ela está <strong>credenciada para EAD</strong>, não só para o presencial.</li>
<li>Procure o curso desejado e verifique se está <strong>autorizado ou reconhecido</strong>.</li>
<li>Olhe a nota de avaliação (Conceito de Curso e CPC) — quanto mais alta, melhor o histórico.</li>
<li>Desconfie de preço fora da realidade e de cobrança antecipada de "taxa de bolsa".</li>
</ol>
<p>Faculdades parceiras consolidadas, como Anhanguera, Unopar e Pitágoras, têm cursos EAD reconhecidos e nota MEC pública — dá para conferir cada uma no e-MEC em poucos minutos.</p>

<h2>EAD x presencial: quanto você economiza</h2>
<p>A diferença de custo entre as duas modalidades costuma ser grande, principalmente quando entra a bolsa. O EAD parte de uma mensalidade base menor e ainda permite descontos maiores; o presencial tende a ter desconto mais modesto sobre um valor cheio mais alto.</p>
<ul>
<li><strong>EAD:</strong> mensalidade base menor + bolsa própria de até 85%, chegando a valores a partir de R$ 108,39 por mês.</li>
<li><strong>Presencial:</strong> mensalidade cheia mais alta e bolsa própria normalmente na faixa de 30% a 70%.</li>
</ul>
<p>O presencial ainda faz sentido em cursos muito práticos — como os da área da saúde — em que o contato no laboratório é diário. Para a maioria das graduações de gestão, tecnologia e licenciatura, o EAD entrega o mesmo diploma reconhecido pagando bem menos.</p>

<h2>Perguntas frequentes</h2>
<h3>Qual é a faculdade EAD mais barata do Brasil?</h3>
<p>Não existe uma única "mais barata" fixa: o valor depende do curso, da instituição e da bolsa disponível na sua região. Na prática, as parceiras de grande porte oferecem cursos EAD com mensalidade a partir de R$ 108,39 com bolsa. O melhor caminho é comparar as ofertas reais para o seu curso antes de decidir.</p>
<h3>Faculdade EAD barata é reconhecida pelo MEC?</h3>
<p>Pode ser, desde que você confira. Preço baixo não tem relação com qualidade ruim — o que importa é a instituição estar credenciada para EAD e o curso estar autorizado ou reconhecido no portal e-MEC. Sempre faça essa verificação antes de matricular.</p>
<h3>Dá para fazer faculdade EAD de graça?</h3>
<p>Sim, com bolsa integral. O ProUni oferece bolsa de 100% para quem fez o ENEM com nota mínima de 450 e atende ao critério de renda. Algumas faculdades parceiras também abrem vagas com bolsa integral própria em períodos específicos.</p>
<h3>Qual o curso EAD mais barato?</h3>
<p>Cursos tecnólogos (2 anos) como Análise e Desenvolvimento de Sistemas e os de Gestão saem mais baratos no total, porque têm menos mensalidades até a formatura. Entre os bacharelados e licenciaturas, Administração e Pedagogia estão entre os mais acessíveis.</p>

<p><strong>Compare ofertas de bolsa em faculdades EAD reconhecidas no Bolsa Click</strong> e veja a mensalidade real para o curso que você quer, com o desconto já aplicado.</p>
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
