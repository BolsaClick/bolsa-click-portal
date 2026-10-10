#!/usr/bin/env tsx
/**
 * Correção pontual (2026-10): 5 posts VIVOS do blog afirmavam desconto/bolsa
 * nosso acima de DISCOUNT_CEILING_PCT (85%, 92% e 95%), violando o lock de
 * claims do CLAUDE.md. Lista confirmada pelo CEO a partir de
 * `npm run audit:blog-claims`.
 *
 * Edição mínima: só o número (e, no FAQ de SP, o mínimo pra frase continuar
 * de pé). Slug não muda — são posts ranqueados. O teto é sempre interpolado
 * da constante, nunca escrito à mão.
 *
 * Cada troca é um trecho literal com contagem esperada: se o texto do banco
 * não bater exatamente, o post é pulado em vez de reescrito às cegas.
 * Idempotente: trecho já corrigido é reportado como "ok" e ignorado.
 *
 * ATENÇÃO: escrita direta no banco NÃO invalida o cache ISR do Next
 * (`app/blog/[slug]/page.tsx` tem revalidate = 86400). A correção só aparece
 * no site depois de redeploy, de uma edição pelo /admin/blog (com
 * `revalidateBlogPost` já em produção) ou do TTL expirar.
 *
 *   npx tsx scripts/fix-blog-ceiling-2026-10.ts           # dry-run
 *   npx tsx scripts/fix-blog-ceiling-2026-10.ts --apply   # grava
 */

import { PrismaClient } from '@prisma/client'
import { DISCOUNT_CEILING_PCT as C } from '../app/lib/copy/claims'

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')

type Field = 'title' | 'excerpt' | 'metaDescription' | 'content'
type Edit = { field: Field; from: string; to: string; count: number }

/** Preço com bolsa no formato da tabela do post ("R$ 1.600"). */
const brl = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`

const FIXES: Record<string, Edit[]> = {
  'bolsas-anhanguera-unopar-2026-descontos': [
    { field: 'excerpt', from: 'bolsas de estudo de até 95% na', to: `bolsas de estudo de até ${C}% na`, count: 1 },
  ],
  'quanto-custa-cursar-administracao-e-direito-2026': [
    { field: 'metaDescription', from: 'bolsas de até 85%.', to: `bolsas de até ${C}%.`, count: 1 },
    { field: 'content', from: 'bolsas de estudo de até 85%.', to: `bolsas de estudo de até ${C}%.`, count: 1 },
    { field: 'content', from: 'descontos de até 85% em', to: `descontos de até ${C}% em`, count: 1 },
  ],
  'auditor-fiscal-faculdade-salario-concurso-e-como-comecar-na-carreira-em-2026': [
    { field: 'metaDescription', from: 'bolsas de estudo de até 85%.', to: `bolsas de estudo de até ${C}%.`, count: 1 },
    // Mesmo claim repetido no corpo (o auditor não pegava por causa de "EAD" no entorno)
    { field: 'content', from: 'com até 85% de desconto', to: `com até ${C}% de desconto`, count: 1 },
    { field: 'content', from: 'bolsas de até 85%</p>', to: `bolsas de até ${C}%</p>`, count: 1 },
  ],
  'bolsas-estudo-sao-paulo-2025-universidades-precos': [
    {
      field: 'content',
      from: 'Unopar (92%), seguida de Anhanguera (80%) e Pitágoras (75%).',
      to: `Unopar e Anhanguera (até ${C}%), seguidas de Pitágoras (75%).`,
      count: 1,
    },
    { field: 'content', from: '<li>50-92% de desconto</li>', to: `<li>50-${C}% de desconto</li>`, count: 1 },
    // Linha da tabela: "Com Bolsa" é mensalidade base × (1 − bolsa máxima), como nas demais linhas
    {
      field: 'content',
      from: '<td>R$ 1.290</td><td>92%</td><td>R$ 99</td>',
      to: `<td>R$ 1.290</td><td>${C}%</td><td>${brl(1290 * (1 - C / 100))}</td>`,
      count: 1,
    },
  ],
  'faculdade-administracao-ead-sao-paulo-bolsas': [
    { field: 'title', from: 'bolsas de até 85%', to: `bolsas de até ${C}%`, count: 1 },
  ],
}

const occurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1

async function main() {
  console.log(`${APPLY ? 'APLICANDO' : 'DRY-RUN'} — teto vigente: ${C}%\n`)
  let failed = false

  for (const [slug, edits] of Object.entries(FIXES)) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, title: true, excerpt: true, metaDescription: true, content: true },
    })
    if (!post) {
      console.log(`✗ /blog/${slug}: post não encontrado`)
      failed = true
      continue
    }

    const next: Record<Field, string> = {
      title: post.title,
      excerpt: post.excerpt ?? '',
      metaDescription: post.metaDescription ?? '',
      content: post.content,
    }
    const changed = new Set<Field>()
    let ok = true

    for (const e of edits) {
      const n = occurrences(next[e.field], e.from)
      if (n === e.count) {
        next[e.field] = next[e.field].split(e.from).join(e.to)
        changed.add(e.field)
        console.log(`  /blog/${slug} [${e.field}]\n    - ${e.from}\n    + ${e.to}`)
      } else if (n === 0 && occurrences(next[e.field], e.to) >= e.count) {
        console.log(`  /blog/${slug} [${e.field}] ok (já corrigido): ${e.to}`)
      } else {
        console.log(`✗ /blog/${slug} [${e.field}] esperava ${e.count}× "${e.from}", achou ${n}`)
        ok = false
      }
    }

    if (next.metaDescription.length > 155) {
      console.log(`  ! metaDescription com ${next.metaDescription.length} caracteres`)
    }

    if (!ok) {
      console.log(`✗ /blog/${slug}: pulado (texto não bate)\n`)
      failed = true
      continue
    }
    if (APPLY && changed.size) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: Object.fromEntries([...changed].map(f => [f, next[f]])),
      })
      console.log(`✓ /blog/${slug}: gravado (${[...changed].join(', ')})\n`)
    } else {
      console.log()
    }
  }

  await prisma.$disconnect()
  if (failed) process.exit(1)
}

main().catch(async err => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
