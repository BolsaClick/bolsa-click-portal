/**
 * Meta-seed idempotente.
 *
 * Reproduz o estado curado do banco para Central de Ajuda + FeaturedCourse +
 * flag hasCityPages. Roda via `npx prisma db seed` (registrado em package.json).
 *
 * Flags:
 *   --dry-run          Não escreve no DB, só loga o que seria feito
 *   --only=<step>      Roda apenas uma etapa: help | courses | cityflag
 *
 * Exemplos:
 *   npx prisma db seed                           # tudo
 *   npx prisma db seed -- --dry-run              # simula
 *   npx prisma db seed -- --only=help            # só central de ajuda
 *   npx prisma db seed -- --only=cityflag        # só ativa hasCityPages
 */

import { PrismaClient } from '@prisma/client'
import { helpCategories, helpArticles, countHelpArticles } from './_seeds/help-center-data'

type StepName = 'help' | 'courses' | 'cityflag'

const args = parseArgs(process.argv.slice(2))
const DRY_RUN = !!args['dry-run']
const ONLY = (args.only as StepName | undefined) ?? undefined

const prisma = new PrismaClient()

function parseArgs(argv: string[]): Record<string, string | boolean> {
  return Object.fromEntries(
    argv
      .filter((a) => a.startsWith('--'))
      .map((a) => {
        const eq = a.indexOf('=')
        return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)]
      }),
  )
}

function shouldRun(step: StepName): boolean {
  return !ONLY || ONLY === step
}

async function seedHelpCenter() {
  console.log('\n━━━ [1/3] Central de Ajuda ━━━')
  const totalArticles = countHelpArticles()
  console.log(`  Categorias no source: ${helpCategories.length}`)
  console.log(`  Artigos no source:    ${totalArticles}`)

  if (DRY_RUN) {
    console.log('  [DRY-RUN] pulando writes')
    return { categoriesUpserted: 0, articlesUpserted: 0 }
  }

  let categoriesUpserted = 0
  let articlesUpserted = 0

  // Categorias (upsert por slug)
  const categoryIdBySlug: Record<string, string> = {}
  for (const cat of helpCategories) {
    const result = await prisma.helpCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: true,
      },
      update: {
        title: cat.title,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: true,
      },
    })
    categoryIdBySlug[cat.slug] = result.id
    categoriesUpserted++
  }
  console.log(`  ✓ ${categoriesUpserted} categorias upsertadas`)

  // Artigos (upsert por categoryId+slug)
  for (const [categorySlug, articles] of Object.entries(helpArticles)) {
    const categoryId = categoryIdBySlug[categorySlug]
    if (!categoryId) {
      console.warn(`  ⚠️  Categoria "${categorySlug}" não está no source — ${articles.length} artigos pulados`)
      continue
    }
    for (const art of articles) {
      await prisma.helpArticle.upsert({
        where: { categoryId_slug: { categoryId, slug: art.slug } },
        create: {
          categoryId,
          slug: art.slug,
          title: art.title,
          description: art.description,
          content: art.content,
          metaTitle: art.metaTitle,
          metaDescription: art.metaDescription,
          order: art.order,
          isActive: true,
          publishedAt: new Date(),
        },
        update: {
          title: art.title,
          description: art.description,
          content: art.content,
          metaTitle: art.metaTitle,
          metaDescription: art.metaDescription,
          order: art.order,
          isActive: true,
        },
      })
      articlesUpserted++
    }
  }
  console.log(`  ✓ ${articlesUpserted} artigos upsertados`)
  return { categoriesUpserted, articlesUpserted }
}

async function seedFeaturedCourses() {
  console.log('\n━━━ [2/3] FeaturedCourse (enrichment via JSON) ━━━')

  // Import dinâmico: o módulo é .mjs (ESM) e expõe enrichCoursesFromJson
  // que aceita prisma externo pra reuso da conexão.
  const mod = (await import('./enrich-courses-from-json.mjs')) as {
    enrichCoursesFromJson: (opts: {
      dryRun?: boolean
      slug?: string
      file?: string
      prisma?: PrismaClient
    }) => Promise<{ ok: number; fail: number; errors: Array<{ slug: string; error: string }> }>
  }

  const result = await mod.enrichCoursesFromJson({
    dryRun: DRY_RUN,
    prisma,
  })

  if (result.errors?.length) {
    console.warn(`  ⚠️  ${result.errors.length} cursos falharam — não é fatal, seed continua`)
  }
  return result
}

async function activateCityPages() {
  console.log('\n━━━ [3/3] Ativar hasCityPages em todos os cursos ativos ━━━')

  if (DRY_RUN) {
    const eligible = await prisma.featuredCourse.count({ where: { isActive: true } })
    const alreadyActive = await prisma.featuredCourse.count({
      where: { isActive: true, hasCityPages: true },
    })
    console.log(`  [DRY-RUN] elegíveis: ${eligible}, já ativos: ${alreadyActive}, a ativar: ${eligible - alreadyActive}`)
    return { updated: 0 }
  }

  const before = await prisma.featuredCourse.count({
    where: { isActive: true, hasCityPages: true },
  })
  const result = await prisma.featuredCourse.updateMany({
    where: { isActive: true, hasCityPages: false },
    data: { hasCityPages: true },
  })
  const after = await prisma.featuredCourse.count({
    where: { isActive: true, hasCityPages: true },
  })
  console.log(`  ✓ ${result.count} cursos atualizados (antes: ${before}, depois: ${after})`)
  return { updated: result.count, before, after }
}

async function main() {
  console.log(`═══════════════════════════════════════════════`)
  console.log(`  seed.ts  dry-run=${DRY_RUN}  only=${ONLY ?? 'all'}`)
  console.log(`═══════════════════════════════════════════════`)

  const startedAt = Date.now()

  if (shouldRun('help')) await seedHelpCenter()
  if (shouldRun('courses')) await seedFeaturedCourses()
  if (shouldRun('cityflag')) await activateCityPages()

  const elapsedSec = Math.round((Date.now() - startedAt) / 1000)
  console.log(`\n═══════════════════════════════════════════════`)
  console.log(`  Concluído em ${elapsedSec}s`)
  console.log(`═══════════════════════════════════════════════\n`)
}

main()
  .catch((err) => {
    console.error('\n✗ Erro fatal no seed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
