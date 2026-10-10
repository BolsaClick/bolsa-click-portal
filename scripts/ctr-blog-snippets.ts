#!/usr/bin/env tsx
/**
 * Passada de CTR nos posts do blog com mais impressões (GSC jul–out/2026).
 *
 * O blog rankeia em posição média 7,6 com CTR de 0,35%. Nos 20 posts de maior
 * impressão, 13 tinham title cortado no Google (62–86 caracteres com a marca)
 * e 7 tinham description acima de 155 — o gancho (preço, %, resposta) ficava
 * justamente no pedaço cortado. Aqui só mudam metaTitle e metaDescription:
 * slug, title (H1), excerpt e conteúdo ficam intactos.
 *
 * Regras de copy aplicadas:
 *  - metaTitle ≤ 46 (o layout acrescenta " | Bolsa Click" → ≤ 60 no SERP),
 *    description ≤ 155, resposta nas primeiras palavras (CLAUDE.md).
 *  - Nenhum preço: os preços dos snippets antigos não têm lastro no catálogo
 *    atual (ex.: "a partir de R$ 99" no EAD, mas o DATA_BLOCK que gerou o post
 *    tinha mínimo de R$ 108,39). Preço volta ao snippet quando vier de dado
 *    vivo, não de texto salvo.
 *  - Teto de desconto sempre interpolado de DISCOUNT_CEILING_PCT.
 *
 * Fora desta passada: arraia-ou-arraial-qual-e-o-certo (já noindex) e
 * grandes-navegacoes-motivos-rotas-consequencias (fora do tema; decisão de
 * noindex é editorial).
 *
 *   npx tsx scripts/ctr-blog-snippets.ts --check   # só valida, sem banco
 *   npx tsx scripts/ctr-blog-snippets.ts           # mostra antes → depois (lê o banco)
 *   npx tsx scripts/ctr-blog-snippets.ts --apply   # grava (PRODUÇÃO — só com aval)
 *
 * Gravar direto pelo Prisma não invalida o ISR: cada post atualiza no
 * próximo ciclo (revalidate = 86400) ou no próximo deploy.
 */
import { PrismaClient } from '@prisma/client'
import { DISCOUNT_CEILING_PCT } from '../app/lib/copy/claims'
import { renderedTitleLength, validateBlogSnippet } from '../app/lib/seo/snippet-limits'

const pct = DISCOUNT_CEILING_PCT

const SNIPPETS: { slug: string; metaTitle: string; metaDescription: string }[] = [
  {
    slug: 'quanto-custa-uma-faculdade-particular',
    metaTitle: 'Quanto custa faculdade particular em 2026?',
    metaDescription: `Depende do curso e da modalidade: tecnólogo EAD é o mais barato e Medicina, o mais caro. Veja a mensalidade por área e como pagar com bolsa de até ${pct}%.`,
  },
  {
    slug: 'faculdade-ead-mais-barata',
    metaTitle: 'Qual a faculdade EAD mais barata em 2026?',
    metaDescription: `Compare mensalidades EAD na Anhanguera, Unopar, Pitágoras e Unime por curso, com nota MEC e bolsa de até ${pct}% sem ENEM. Cadastro grátis, sem taxa de adesão.`,
  },
  {
    slug: 'cursos-ead-mais-procurados-2026',
    metaTitle: '10 cursos EAD mais procurados em 2026',
    metaDescription: `Administração, Pedagogia e ADS lideram o ranking de 2026. Veja os 10 cursos EAD mais buscados, duração de cada um e como estudar com bolsa de até ${pct}%.`,
  },
  {
    slug: 'posso-perder-bolsa-de-estudo-motivos',
    metaTitle: 'Posso perder a bolsa de estudo? 7 motivos',
    metaDescription:
      'Sim: reprovação, trancamento e mudança de renda estão entre os 7 motivos que cancelam bolsa do ProUni ou bolsa própria. Veja como evitar cada um.',
  },
  {
    slug: 'como-verificar-faculdade-emec-passo-a-passo',
    metaTitle: 'Como consultar faculdade no e-MEC em 5 passos',
    metaDescription:
      'No e-MEC, o site oficial do MEC, você busca a faculdade pelo nome e vê credenciamento, IGC e a nota de cada curso (CPC e ENADE). Veja o passo a passo.',
  },
  {
    slug: 'nota-minima-enem-prouni-quanto-precisa',
    metaTitle: 'Nota mínima do ENEM pro ProUni: 450 pontos',
    metaDescription:
      'O mínimo do ProUni é média de 450 pontos no ENEM e redação acima de zero. A nota de corte real muda por curso e faculdade; entenda como o ranking funciona.',
  },
  {
    slug: 'bolsa-de-estudo-segunda-graduacao-pode',
    metaTitle: 'Bolsa na 2ª graduação: ProUni não, própria sim',
    metaDescription:
      'ProUni e FIES vedam quem já tem diploma, mas a bolsa própria das faculdades parceiras aceita segunda graduação. Entenda as regras e como se candidatar.',
  },
  {
    slug: 'bolsa-sem-prouni',
    metaTitle: 'Bolsa sem ProUni: 5 alternativas em 2026',
    metaDescription: `Dá pra estudar com bolsa sem ProUni: bolsa própria das faculdades (até ${pct}%, sem ENEM), FIES e bolsas filantrópicas. Veja as 5 alternativas e quem pode.`,
  },
  {
    // "o que é bolsa integral" e variações: ~1.600 impressões no período.
    slug: 'bolsa-50-vs-100-qual-vale-mais',
    metaTitle: 'Bolsa integral ou 50%: o que é e qual compensa',
    metaDescription:
      'Bolsa integral cobre 100% da mensalidade; a parcial cobre uma parte, como 50%. Compare critérios de renda, economia real e qual faz mais sentido pra você.',
  },
  {
    slug: 'faculdade-direito-ead-mec-oab',
    metaTitle: 'Direito EAD existe? O que dizem MEC e OAB',
    metaDescription:
      'Direito EAD existe no Brasil? Entenda a regra do MEC, a posição da OAB e por que o curso ainda exige presença física obrigatória.',
  },
  {
    slug: 'mensalidade-de-direito-faculdade-particular',
    metaTitle: 'Quanto custa faculdade de Direito particular?',
    metaDescription: `A mensalidade cheia de Direito muda muito por cidade e faculdade. Veja valores por região, os custos extras do curso e como estudar com bolsa de até ${pct}%.`,
  },
  {
    slug: 'como-conseguir-bolsa-estudo-50-faculdade',
    metaTitle: 'Bolsa de 50% ou mais: como conseguir em 2026',
    metaDescription: `Os caminhos são ProUni (integral ou 50%), FIES e a bolsa própria das faculdades parceiras, de até ${pct}% sem ENEM. Veja o passo a passo de cada um.`,
  },
  {
    slug: 'vale-a-pena-fazer-faculdade-a-noite-trabalhando-de-dia',
    metaTitle: 'Vale a pena fazer faculdade à noite?',
    metaDescription:
      'Faculdade à noite trabalhando de dia compensa? Veja os ganhos, os desafios e como organizar a rotina para se formar sem abrir mão do seu salário.',
  },
  {
    slug: 'anhanguera-ead-como-conseguir-bolsa',
    metaTitle: 'Anhanguera EAD: como conseguir bolsa em 2026',
    metaDescription: `Escolha o curso, compare as ofertas e se inscreva grátis: a bolsa na Anhanguera EAD chega a ${pct}%, sem nota de corte, em cursos reconhecidos pelo MEC.`,
  },
  {
    slug: 'anhanguera-vale-a-pena-mec-bolsas',
    metaTitle: 'Anhanguera vale a pena? Nota MEC e bolsas',
    metaDescription: `Vale pra quem prioriza preço e polo perto de casa. A Anhanguera tem conceito 3 no MEC e bolsa de até ${pct}%; veja prós, contras e como checar a nota do curso.`,
  },
  {
    slug: 'segunda-chamada-do-sisu-como-funciona-como-se-inscrever',
    metaTitle: 'Segunda chamada do SISU: como se inscrever',
    metaDescription:
      'A segunda chamada do SISU é a lista de espera: quem não foi aprovado na chamada regular manifesta interesse e pode ser convocado. Veja o passo a passo.',
  },
  {
    slug: 'estudar-de-manha-ou-a-noite-qual-horario-e-mais-produtivo',
    metaTitle: 'Estudar de manhã ou à noite: o que rende mais?',
    metaDescription:
      'Estudar de manhã ou à noite? Entenda seu cronotipo, veja as vantagens de cada turno e monte uma rotina de estudos que realmente funciona.',
  },
  {
    slug: 'unopar-vale-a-pena-mec-bolsas',
    metaTitle: 'Unopar vale a pena? Nota MEC e bolsas',
    metaDescription: `Vale pra quem quer EAD com polo perto de casa. A Unopar tem conceito 3 no MEC e bolsa de até ${pct}%; veja prós, contras e como checar a nota do curso.`,
  },
]

const FORBIDDEN = [/\bAmpli\b/i, /Quero\s*Bolsa/i, /Educa\s*Mais/i, /Vai\s*de\s*Bolsa/i, /Bolsa\s*Universit[áa]ria/i]

function check(): boolean {
  let ok = true
  const seen = new Set<string>()
  for (const s of SNIPPETS) {
    const problems = validateBlogSnippet(s).map(i => i.message)
    const text = `${s.metaTitle} ${s.metaDescription}`
    for (const rx of FORBIDDEN) if (rx.test(text)) problems.push(`marca proibida: ${rx.source}`)
    // Acima do teto só passa como definição de bolsa integral (mesma exclusão
    // de NOT_A_DISCOUNT em scripts/audit-blog-claims.ts), nunca como desconto.
    for (const m of text.matchAll(/(\d{1,3})\s*%/g)) {
      const n = Number(m[1])
      const around = text.slice(Math.max(0, m.index! - 40), m.index! + 40)
      if (n > pct && !/integral/i.test(around)) problems.push(`percentual ${n}% acima do teto ${pct}%`)
    }
    if (/R\$\s*\d/.test(text)) problems.push('preço no snippet sem lastro de catálogo')
    if (seen.has(s.slug)) problems.push('slug repetido')
    seen.add(s.slug)
    const t = renderedTitleLength(s.metaTitle)
    console.log(`${problems.length ? '✗' : '✓'} ${s.slug}  T=${t} D=${s.metaDescription.length}`)
    for (const p of problems) console.log(`    ${p}`)
    if (problems.length) ok = false
  }
  return ok
}

async function main() {
  const mode = process.argv.includes('--apply') ? 'apply' : process.argv.includes('--check') ? 'check' : 'diff'
  const ok = check()
  if (!ok) {
    console.error('\nValidação falhou — nada foi lido nem gravado.')
    process.exit(1)
  }
  if (mode === 'check') return

  const prisma = new PrismaClient()
  try {
    for (const s of SNIPPETS) {
      const post = await prisma.blogPost.findUnique({
        where: { slug: s.slug },
        select: { id: true, title: true, metaTitle: true, metaDescription: true, excerpt: true },
      })
      if (!post) {
        console.log(`\n! ${s.slug}: não encontrado — pulando`)
        continue
      }
      const beforeT = post.metaTitle || post.title
      const beforeD = post.metaDescription || post.excerpt
      console.log(`\n${s.slug}`)
      console.log(`  T ${renderedTitleLength(beforeT)} → ${renderedTitleLength(s.metaTitle)}: ${beforeT}  →  ${s.metaTitle}`)
      console.log(`  D ${beforeD.length} → ${s.metaDescription.length}: ${s.metaDescription}`)
      if (mode === 'apply') {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { metaTitle: s.metaTitle, metaDescription: s.metaDescription, updatedBy: 'ctr-blog-snippets' },
        })
        console.log('  gravado')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
