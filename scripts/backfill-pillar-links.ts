/**
 * backfill-pillar-links
 * ---------------------
 * Ativa o cluster hub-and-spoke: injeta UM link contextual pro pillar
 * /bolsas-de-estudo nos posts ativos que não têm nenhum. Ponto de injeção: um
 * <p> de CTA logo antes da seção "Perguntas frequentes" (ou no fim, se não houver).
 * Âncora + frase VARIADAS por índice (evita footprint de link idêntico em massa).
 *
 * Idempotente: pula qualquer post que já referencie /bolsas-de-estudo.
 *
 * Flags: --dry-run (não escreve), LIMIT=N (só os N primeiros).
 * Uso: node --env-file=.env --import tsx scripts/backfill-pillar-links.ts --dry-run
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT = Number(process.argv.find((a) => a.startsWith('LIMIT='))?.split('=')[1] ?? 0)

// Frases-ponte (educação/faculdade → bolsa) com âncora variada. Rotacionadas por
// índice pra dar variedade natural de anchor text.
const CTA_VARIANTS: string[] = [
  'Antes de se matricular, vale comparar as <a href="/bolsas-de-estudo">bolsas de estudo disponíveis</a> — os descontos chegam a 80%.',
  'E na hora de custear a faculdade, veja o <a href="/bolsas-de-estudo">guia de bolsas de estudo</a> pra encontrar a melhor oferta.',
  'Depois de decidir o caminho, confira as <a href="/bolsas-de-estudo">bolsas de estudo de até 80%</a> em faculdades parceiras.',
  'Pra viabilizar a graduação, dá pra <a href="/bolsas-de-estudo">comparar bolsas de estudo</a> sem nota de corte e sem ENEM.',
  'Quando decidir onde estudar, as <a href="/bolsas-de-estudo">bolsas de estudo no Bolsa Click</a> reduzem bastante a mensalidade.',
  'Vale também olhar as <a href="/bolsas-de-estudo">ofertas de bolsa de estudo</a> disponíveis antes de fechar a matrícula.',
  'E pra pagar menos na faculdade, veja como funcionam as <a href="/bolsas-de-estudo">bolsas de estudo</a> de até 80%.',
  'Se o próximo passo é a faculdade, compare as <a href="/bolsas-de-estudo">bolsas de estudo</a> em mais de 280 cidades.',
]

// Acha o índice de início da seção FAQ (heading h2/h3 com "perguntas frequentes"
// ou "faq"). Retorna -1 se não houver.
function faqHeadingIndex(html: string): number {
  const re = /<h[23][^>]*>\s*(?:[^<]*)(perguntas frequentes|faq)(?:[^<]*)\s*<\/h[23]>/i
  const m = re.exec(html)
  return m ? m.index : -1
}

function injectCta(html: string, cta: string): string {
  const block = `<p>${cta}</p>`
  const faqIdx = faqHeadingIndex(html)
  if (faqIdx >= 0) {
    return html.slice(0, faqIdx) + block + html.slice(faqIdx)
  }
  return html + block
}

async function main() {
  const all = await prisma.blogPost.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, content: true },
    orderBy: { createdAt: 'asc' },
  })
  const orphans = all.filter((p) => !(p.content || '').includes('/bolsas-de-estudo'))
  const targets = LIMIT > 0 ? orphans.slice(0, LIMIT) : orphans

  console.log('═══════════════════════════════════════════════')
  console.log(`  backfill-pillar-links  dry-run=${DRY_RUN}`)
  console.log(`  posts ativos=${all.length} | órfãos do pillar=${orphans.length} | alvo=${targets.length}`)
  console.log('═══════════════════════════════════════════════\n')

  let done = 0
  for (const [i, post] of targets.entries()) {
    const cta = CTA_VARIANTS[i % CTA_VARIANTS.length]
    const newContent = injectCta(post.content || '', cta)
    const pos = faqHeadingIndex(post.content || '') >= 0 ? 'antes-FAQ' : 'fim'

    if (DRY_RUN) {
      console.log(`  [${pos}] ${post.slug}`)
      console.log(`      ${cta.replace(/<[^>]+>/g, (t) => (t.startsWith('<a') ? '[' : t === '</a>' ? ']' : ''))}\n`)
    } else {
      await prisma.blogPost.update({ where: { id: post.id }, data: { content: newContent } })
      done++
    }
  }

  console.log(`\n${DRY_RUN ? '(dry-run, nada escrito)' : `atualizados: ${done}`}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
