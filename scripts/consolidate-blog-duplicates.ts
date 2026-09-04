#!/usr/bin/env tsx
/**
 * scripts/consolidate-blog-duplicates.ts
 *
 * Desativa posts de blog duplicados, deixando vivo só o slug canônico.
 *
 * DE ONDE VEIO O PROBLEMA: uma rodada de geração criou variante com sufixo
 * `-2026-07` em vez de atualizar o post existente. As duas versões ficaram
 * ativas competindo pela mesma query — e três dos quatro pares vivos são termos
 * de dinheiro (prouni, desconto em faculdade, bolsa pra quem já trabalha).
 *
 * ORDEM OBRIGATÓRIA — não inverta:
 *   1. Fazer deploy dos 301 de next.config.ts (`blogDupes`).
 *   2. Só então rodar este script com --apply.
 * `app/blog/[slug]/page.tsx` filtra por `isActive`, então desativar antes do
 * redirect estar no ar transforma a URL em 404 e joga fora a autoridade dos
 * links que apontam pra ela. O 404 é pior que a duplicata.
 *
 * REVERSÍVEL: só mexe em `isActive`. Nenhum post é apagado, nenhum conteúdo é
 * reescrito. Pra desfazer, basta voltar o flag pra true.
 *
 * USO:
 *   npx tsx scripts/consolidate-blog-duplicates.ts            # dry-run (padrão)
 *   npx tsx scripts/consolidate-blog-duplicates.ts --apply    # grava
 */

import { PrismaClient } from '@prisma/client'

const APPLY = process.argv.includes('--apply')
const prisma = new PrismaClient()

/** [slug a desativar, slug que sobrevive] — espelha `blogDupes` em next.config.ts. */
const PAIRS: [string, string][] = [
  [
    'prouni-2026-inscricao-notas-de-corte-como-usar-2026-07',
    'prouni-2026-inscricao-notas-de-corte-como-usar',
  ],
  [
    'desconto-em-faculdade-diferenca-prouni-fies-bolsa-direta-2026-07',
    'desconto-em-faculdade-diferenca-prouni-fies-bolsa-direta',
  ],
  [
    'bolsas-de-estudo-para-quem-ja-trabalha-opcoes-como-concorrer-2026-07',
    'bolsas-de-estudo-para-quem-ja-trabalha-opcoes-como-concorrer',
  ],
  [
    'quem-foi-louis-pasteur-descobertas-medicina-2026-07',
    'quem-foi-louis-pasteur-descobertas-medicina',
  ],
]

async function main() {
  console.log(`consolidate-blog-duplicates  ${APPLY ? 'APPLY' : 'dry-run'}\n`)

  let desativados = 0
  let pulados = 0

  for (const [dupSlug, keepSlug] of PAIRS) {
    const [dup, keep] = await Promise.all([
      prisma.blogPost.findUnique({
        where: { slug: dupSlug },
        select: { id: true, isActive: true, content: true },
      }),
      prisma.blogPost.findUnique({
        where: { slug: keepSlug },
        select: { id: true, isActive: true, content: true, publishedAt: true },
      }),
    ])

    // Nunca desativar sem ter certeza de que o sobrevivente está no ar. Sem esta
    // guarda, um erro de digitação no slug canônico derrubaria os DOIS posts.
    if (!keep || !keep.isActive || !keep.publishedAt) {
      console.log(`  PULADO  ${dupSlug}`)
      console.log(`          sobrevivente ausente ou inativo: ${keepSlug}`)
      pulados++
      continue
    }
    if (!dup) {
      console.log(`  PULADO  ${dupSlug} (não existe)`)
      pulados++
      continue
    }
    if (!dup.isActive) {
      console.log(`  ok      ${dupSlug} já estava inativo`)
      continue
    }

    const delta = dup.content.length - keep.content.length
    const aviso =
      delta > 0
        ? `  ATENÇÃO: o desativado é ${delta} caracteres MAIOR que o sobrevivente`
        : ''

    console.log(`  ${APPLY ? 'DESATIVA' : 'desativaria'}  ${dupSlug}`)
    console.log(`          → 301 para ${keepSlug}${aviso}`)

    if (APPLY) {
      await prisma.blogPost.update({
        where: { id: dup.id },
        data: { isActive: false },
      })
    }
    desativados++
  }

  console.log(
    `\n${APPLY ? 'desativados' : 'seriam desativados'}: ${desativados}  pulados: ${pulados}`,
  )
  if (!APPLY) console.log('Nada foi gravado. Use --apply depois que os 301 estiverem em produção.')
}

main()
  .catch((e) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
