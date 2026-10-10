#!/usr/bin/env tsx
/**
 * Auditoria de claims no conteúdo VIVO do blog.
 *
 * Detecta duas violações do CLAUDE.md que já aconteceram em produção:
 *
 *  1. MARCAS PROIBIDAS — concorrentes agregadores e marcas que a política
 *     editorial manda não citar (ex.: Ampli). Em out/2026 havia 8 posts no ar
 *     citando "Ampli" em enumeração de parceiras e em claim de preço.
 *
 *  2. PERCENTUAL ACIMA DO TETO — o CLAUDE.md diz, literalmente, que publicar
 *     desconto acima de DISCOUNT_CEILING_PCT "já aconteceu por engano no
 *     passado". Este checker existe pra isso não depender de alguém lembrar.
 *
 * Diferente de `lock-copy-claims.ts`, que é o registro de uma migração
 * pontual já aplicada (e hoje auto-abortada por guard), este script não
 * escreve nada: só detecta e sai com código 1 se achar violação, pra poder
 * rodar em CI.
 *
 * O ponto delicado é o falso positivo. "100% online", "100% gratuito",
 * "diploma 100% válido", "curso 100% EAD" e a bolsa integral do ProUni (que
 * é federal, 100% real e legítima de citar) NÃO são claim de desconto nosso.
 * O filtro exige contexto de desconto e descarta esses casos — por isso ele
 * reporta ~16 ocorrências onde um grep ingênuo por `\d+%` reportaria 100+.
 * Ainda assim, a saída é pra revisão humana: ele aponta, não julga.
 *
 *   npx tsx scripts/audit-blog-claims.ts
 *   npm run audit:blog-claims
 */

import { PrismaClient } from '@prisma/client'
import { DISCOUNT_CEILING_PCT } from '../app/lib/copy/claims'

const prisma = new PrismaClient()

/** Marcas que não podem aparecer em conteúdo público. Ver CLAUDE.md. */
const FORBIDDEN_BRANDS: RegExp[] = [
  /\bAmpli\b/g,
  /\bQuero\s*Bolsa\b/gi,
  /\bEduca\s*Mais\s*Brasil\b/gi,
  /\bEduca\s*Mais\b/gi,
  /\bVai\s*de\s*Bolsa\b/gi,
  /\bBolsa\s*Universit[áa]ria\b/gi,
]

const FIELDS = ['title', 'metaTitle', 'excerpt', 'metaDescription', 'content'] as const

/**
 * Contexto que desqualifica um percentual como claim de desconto nosso:
 * bolsa integral do ProUni/FIES, taxa de emprego/aprovação, etc. Testado na
 * janela inteira em volta do número.
 *
 * Modalidade e validade ("online", "EAD", "MEC", "válido"...) NÃO entram
 * aqui: na janela larga elas escondiam claim real — "até 85% de desconto em
 * cursos EAD" passava batido porque "EAD" estava a menos de 110 caracteres.
 * Em out/2026 isso deixou posts com 85% fora do relatório.
 */
const NOT_A_DISCOUNT =
  /(ProUni|FIES|federal|filantrópic|integra(l|is)|financia|aprovei|reembols|segur|emprego|aprovação)/i

/**
 * Logo DEPOIS do número: "100% online", "100% MEC válido", "cursos 100%
 * digitais", "85% dos alunos". Só desqualifica quando a palavra vem colada
 * ao percentual.
 */
const NOT_A_DISCOUNT_RIGHT_AFTER =
  /^\s*(online|EAD|a distância|digita|gratuit|grátis|MEC|válid|presencial|assíncron|síncron|d[oa]s alunos)/i

/** Exige que o trecho realmente fale de desconto/bolsa/mensalidade. */
const IS_DISCOUNT_CONTEXT = /(desconto|bolsa|mensalidade|off|economi)/i

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
}

type Finding = { slug: string; field: string; detail: string }

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { isActive: true, publishedAt: { not: null } },
    select: { slug: true, title: true, metaTitle: true, excerpt: true, metaDescription: true, content: true },
  })

  const brandHits: Finding[] = []
  const ceilingHits: Finding[] = []

  for (const post of posts) {
    for (const field of FIELDS) {
      const raw = (post[field] ?? '') as string
      if (!raw) continue
      const text = strip(raw)

      for (const re of FORBIDDEN_BRANDS) {
        for (const m of text.matchAll(re)) {
          brandHits.push({
            slug: post.slug,
            field,
            detail: `"${m[0]}" — …${text.slice(Math.max(0, m.index! - 80), m.index! + 50).trim()}…`,
          })
        }
      }

      for (const m of text.matchAll(/(\d{2,3})\s*%/g)) {
        const pct = Number(m[1])
        if (pct <= DISCOUNT_CEILING_PCT || pct > 100) continue
        const window = text.slice(Math.max(0, m.index! - 110), m.index! + 60)
        if (NOT_A_DISCOUNT.test(window)) continue
        if (NOT_A_DISCOUNT_RIGHT_AFTER.test(text.slice(m.index! + m[0].length))) continue
        if (!IS_DISCOUNT_CONTEXT.test(window)) continue
        ceilingHits.push({ slug: post.slug, field, detail: `${pct}% — …${window.trim()}…` })
      }
    }
  }

  console.log(`posts vivos auditados: ${posts.length}`)
  console.log(`teto vigente: ${DISCOUNT_CEILING_PCT}%\n`)

  const report = (titulo: string, hits: Finding[]) => {
    const slugs = new Set(hits.map(h => h.slug))
    console.log(`### ${titulo}: ${hits.length} ocorrência(s) em ${slugs.size} post(s)`)
    for (const h of hits) console.log(`  /blog/${h.slug} [${h.field}]\n    ${h.detail}`)
    console.log()
  }

  report('MARCAS PROIBIDAS', brandHits)
  report('PERCENTUAL ACIMA DO TETO (revisar — pode haver falso positivo)', ceilingHits)

  await prisma.$disconnect()

  if (brandHits.length || ceilingHits.length) {
    console.error(
      `FALHOU: ${brandHits.length} violação(ões) de marca e ${ceilingHits.length} de teto.`,
    )
    process.exit(1)
  }
  console.log('OK — nenhuma violação encontrada.')
}

main().catch(async err => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
