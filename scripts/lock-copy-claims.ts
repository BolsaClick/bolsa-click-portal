#!/usr/bin/env tsx
/**
 * Lock de claims em produção / staging:
 *  - upsert da instituição Wyden (6ª rede do diretório /faculdades)
 *  - reescreve /blog/como-conseguir-bolsa-estudo-2026-guia-passo-a-passo
 *  - troca 80% → 78% em /blog/como-conseguir-bolsa-anhanguera-sem-enem
 *    (migração pontual de 2026-08, quando o teto era 78%; ver histórico
 *    do arquivo antes de reaproveitar)
 *
 * ATENÇÃO (2026-09-02): DISCOUNT_CEILING_PCT em claims.ts subiu pra 80.
 * `lockCeilingText`/`lockAnhangueraPost` fazem exatamente o oposto do que a
 * constante manda hoje — rodar isto agora reescreveria conteúdo correto
 * (80%) pro valor antigo (78%). Por isso o guard abaixo aborta enquanto a
 * constante não voltar a ser 78. Não removi a lógica: é o registro de uma
 * migração específica já aplicada, não um gerador reutilizável.
 *
 * Idempotente. Não inventa MEC/campus/preço.
 *
 *   npx tsx scripts/lock-copy-claims.ts
 *   npm run lock:copy-claims
 */

import { PrismaClient } from '@prisma/client'
import { DISCOUNT_CEILING_PCT } from '../app/lib/copy/claims'
import { GUIA_PASSO_A_PASSO, WYDEN_INSTITUTION } from './lock-copy-data'

const prisma = new PrismaClient()
const DEFAULT_IMAGE = '/assets/og-image-bolsaclick.png'
const ANHANGUERA_SLUG = 'como-conseguir-bolsa-anhanguera-sem-enem'

function readingTime(content: string): number {
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return Math.max(3, Math.round(plain.split(' ').filter(Boolean).length / 220))
}

function lockCeilingText(value: string): string {
  return value
    .replace(/até 80%/gi, 'até 78%')
    .replace(/ate 80%/gi, 'até 78%')
    .replace(/80% de desconto/gi, '78% de desconto')
    .replace(/\b80%/g, '78%')
}

async function upsertWyden() {
  const result = await prisma.institution.upsert({
    where: { slug: WYDEN_INSTITUTION.slug },
    update: WYDEN_INSTITUTION,
    create: WYDEN_INSTITUTION,
  })
  console.log(`  ✓ institution ${result.slug} (isActive=${result.isActive}, order=${result.order})`)
}

async function lockGuiaPost() {
  const p = GUIA_PASSO_A_PASSO
  const existing = await prisma.blogPost.findUnique({
    where: { slug: p.slug },
    select: { publishedAt: true, categories: { select: { slug: true } } },
  })

  const base = {
    title: p.title.slice(0, 200),
    excerpt: p.excerpt.slice(0, 280),
    content: p.content,
    metaTitle: p.metaTitle.slice(0, 200),
    metaDescription: p.metaDescription.slice(0, 200),
    keywords: p.keywords.slice(0, 20),
    imageAlt: p.imageAlt.slice(0, 220),
    readingTime: readingTime(p.content),
    tags: p.tags.slice(0, 12),
    isActive: true,
  }

  if (!existing) {
    await prisma.blogPost.create({
      data: {
        ...base,
        slug: p.slug,
        featuredImage: DEFAULT_IMAGE,
        author: 'Equipe Bolsa Click',
        publishedAt: new Date(),
        categories: { connect: p.categorySlugs.map((s) => ({ slug: s })) },
      },
    })
    console.log(`  ✓ blog ${p.slug} created`)
    return
  }

  await prisma.blogPost.update({
    where: { slug: p.slug },
    data: {
      ...base,
      publishedAt: existing.publishedAt ?? new Date(),
    },
  })
  console.log(`  ✓ blog ${p.slug} updated`)
}

async function lockAnhangueraPost() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: ANHANGUERA_SLUG },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
    },
  })

  if (!post) {
    console.log(`  ⊘ blog ${ANHANGUERA_SLUG}: not found (rode seed-branded-posts-manual.ts)`)
    return
  }

  const data = {
    title: lockCeilingText(post.title),
    excerpt: lockCeilingText(post.excerpt),
    content: lockCeilingText(post.content),
    metaTitle: post.metaTitle ? lockCeilingText(post.metaTitle) : post.metaTitle,
    metaDescription: post.metaDescription
      ? lockCeilingText(post.metaDescription)
      : post.metaDescription,
  }

  const changed =
    data.title !== post.title ||
    data.excerpt !== post.excerpt ||
    data.content !== post.content ||
    data.metaTitle !== post.metaTitle ||
    data.metaDescription !== post.metaDescription

  if (!changed) {
    console.log(`  = blog ${ANHANGUERA_SLUG}: already at 78%`)
    return
  }

  await prisma.blogPost.update({
    where: { id: post.id },
    data,
  })
  console.log(`  ✓ blog ${ANHANGUERA_SLUG}: 80% → 78%`)
}

async function main() {
  // `lockAnhangueraPost`/`lockCeilingText` foram escritos pra forçar o texto
  // pra "78%" — isso só faz sentido enquanto DISCOUNT_CEILING_PCT (claims.ts)
  // for 78. Hoje é 80: deixar isto rodar reescreveria conteúdo correto pro
  // valor antigo. Aborta em vez de silenciosamente sabotar o teto atual.
  // (cast pra number: DISCOUNT_CEILING_PCT é um literal type, e comparar
  // literais que não se sobrepõem é erro de tipo em `strict`)
  const currentCeiling: number = DISCOUNT_CEILING_PCT
  if (currentCeiling !== 78) {
    console.error(
      `✗ abortado: DISCOUNT_CEILING_PCT é ${DISCOUNT_CEILING_PCT} (claims.ts), não 78. ` +
        'lockAnhangueraPost forçaria o post de volta pro teto antigo. ' +
        'upsertWyden/lockGuiaPost seguem GUIA_PASSO_A_PASSO (já deriva do teto atual) e são seguros — ' +
        'rode-os isoladamente se for só isso que você precisa, ou revise este script antes de destravar o guard.',
    )
    process.exit(1)
  }
  console.log(`━━━ lock-copy-claims (teto ${DISCOUNT_CEILING_PCT}%, 6 redes, Wyden) ━━━\n`)
  await upsertWyden()
  await lockGuiaPost()
  await lockAnhangueraPost()
  console.log('\nPronto. /faculdades só lista Wyden depois deste upsert no banco alvo.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
