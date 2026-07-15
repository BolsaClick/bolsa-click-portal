/**
 * fix-fabricated-anecdotes
 * ------------------------
 * Remove anedotas em 1ª pessoa FABRICADAS de 6 posts (persona editorial alegando
 * ser professora, com casos pessoais de alunos inventados) — passivo de E-E-A-T
 * e de honestidade apontado na auditoria SEO 2026-07. Exact-match no parágrafo:
 * troca só o bloco fabricado, sem tocar no resto do conteúdo.
 *
 * Dry-run (default): confirma que cada `from` casa exatamente no banco, sem
 * escrever. `--apply` grava.
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')

interface Edit {
  slug: string
  from: string
  to: string
}

const EDITS: Edit[] = [
  {
    slug: 'tecnologo-tem-o-mesmo-valor-que-bacharel',
    from: '<p>Se você já ficou naquela dúvida clássica antes de se inscrever no vestibular — "faço um curso mais curto ou um bacharelado tradicional?" —, respira que eu vou desmontar esse mito com você. Como professora, adoro quando uma pergunta simples esconde uma resposta cheia de nuances. E essa é uma delas.</p>',
    to: '<p>Se você já ficou naquela dúvida clássica antes de se inscrever no vestibular — "faço um curso mais curto ou um bacharelado tradicional?" —, respira: vamos desmontar esse mito. É uma pergunta simples que esconde uma resposta cheia de nuances.</p>',
  },
  {
    slug: 'segunda-chamada-do-sisu-como-funciona-como-se-inscrever',
    from: '<p>Se você prestou o ENEM e ficou por um triz de entrar no curso dos sonhos, respira: a jornada não termina na primeira convocação. Como professora, já vi muita gente desanimar cedo demais e desistir de algo que estava a poucos números de distância. Por isso, preparei este guia completo para explicar cada detalhe de como a segunda chamada acontece e o que você precisa fazer para não perder o timing.</p>',
    to: '<p>Se você prestou o ENEM e ficou por um triz de entrar no curso dos sonhos, respira: a jornada não termina na primeira convocação. Muita gente desanima cedo demais e desiste de algo que estava a poucos números de distância. Por isso, este guia explica cada detalhe de como a segunda chamada acontece e o que você precisa fazer para não perder o timing.</p>',
  },
  {
    slug: 'curso-de-engenharia-de-software-mercado-salario-areas-de-atuacao',
    from: '<p>Lembro de uma aluna, a Camila, que chegou até mim achando que engenharia de software era "só ficar digitando código o dia inteiro". Quando expliquei que ela também estudaria gestão de projetos, segurança, banco de dados e até um pouco de psicologia do usuário, os olhos dela brilharam. Ela percebeu que aquilo combinava com o jeito organizado dela de pensar.</p>',
    to: '<p>Muita gente acha que engenharia de software é "só ficar digitando código o dia inteiro". Na prática, o curso também envolve gestão de projetos, segurança, banco de dados e até um pouco de psicologia do usuário — uma combinação que costuma surpreender quem tem um jeito organizado de pensar.</p>',
  },
  {
    slug: 'diferenca-entre-bacharelado-licenciatura-e-tecnologo-qual-escolher',
    from: '<p>Como professora, vejo muito estudante brilhante escolher o grau errado só porque ninguém explicou a diferença de forma simples. Então vamos resolver isso agora, com analogias do dia a dia e sem juridiquês.</p>',
    to: '<p>Muito estudante brilhante escolhe o grau errado só porque ninguém explicou a diferença de forma simples. Vamos resolver isso agora, com analogias do dia a dia e sem juridiquês.</p>',
  },
  {
    slug: 'como-escolher-faculdade-ead-reconhecida-pelo-mec',
    from: '<p>Lembro de uma conversa com a Beatriz, uma jovem de 22 anos que me procurou visivelmente ansiosa. Ela havia se matriculado num curso online barato, estudado por quase um ano e só então descobriu que aquela oferta não tinha reconhecimento algum. Perdeu tempo, dinheiro e, o mais doloroso, um pedaço da confiança dela mesma. Você já parou para pensar quantas escolhas importantes fazemos no automático, sem verificar o essencial?</p>',
    to: '<p>Não é raro alguém se matricular num curso online barato, estudar por quase um ano e só então descobrir que aquela oferta não tinha reconhecimento algum — perdendo tempo, dinheiro e confiança. Você já parou para pensar quantas escolhas importantes fazemos no automático, sem verificar o essencial?</p>',
  },
  {
    slug: 'eliminacao-do-brasil-na-copa-licoes-para-estudar',
    from: '<p>Como professora de Biologia, eu adoro observar padrões. E quando uma seleção cheia de talento cai antes da hora, o cérebro coletivo do país faz a mesma pergunta: onde erramos? A boa notícia é que essa pergunta, feita com honestidade, é uma das ferramentas de aprendizado mais poderosas que existem. Vamos usar o gramado como laboratório.</p>',
    to: '<p>Observar padrões é revelador. Quando uma seleção cheia de talento cai antes da hora, o cérebro coletivo do país faz a mesma pergunta: onde erramos? A boa notícia é que essa pergunta, feita com honestidade, é uma das ferramentas de aprendizado mais poderosas que existem. Vamos usar o gramado como laboratório.</p>',
  },
]

async function main() {
  console.log(`\n=== fix-fabricated-anecdotes (${APPLY ? 'APPLY' : 'dry-run'}) ===\n`)
  let ok = 0
  let miss = 0
  for (const edit of EDITS) {
    const post = await prisma.blogPost.findUnique({ where: { slug: edit.slug }, select: { content: true } })
    if (!post) {
      console.log(`✗ ${edit.slug}: post não encontrado`)
      miss++
      continue
    }
    if (!post.content.includes(edit.from)) {
      console.log(`✗ ${edit.slug}: trecho NÃO casa (conteúdo mudou?) — pulado`)
      miss++
      continue
    }
    ok++
    if (APPLY) {
      await prisma.blogPost.update({
        where: { slug: edit.slug },
        data: { content: post.content.replace(edit.from, edit.to) },
      })
      console.log(`✓ ${edit.slug}: aplicado`)
    } else {
      console.log(`✓ ${edit.slug}: casa (pronto pra aplicar)`)
    }
  }
  console.log(`\n${ok}/${EDITS.length} casam${miss ? `, ${miss} falharam` : ''}.${APPLY ? '' : ' Rode com --apply pra gravar.'}`)
}
main().finally(() => prisma.$disconnect())
