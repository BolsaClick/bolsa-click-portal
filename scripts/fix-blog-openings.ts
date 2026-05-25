/**
 * One-off: reescreve a primeira <p> de posts que abrem com contextualização,
 * pra cumprir a regra GEO de resposta direta (CLAUDE.md). Idempotente: roda
 * o regex de detecção primeiro e só atualiza se ainda estiver no padrão antigo.
 *
 * Rodar: npx tsx scripts/fix-blog-openings.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Fix {
  slug: string
  oldFirstPRegex: RegExp
  newFirstPHtml: string
}

const FIXES: Fix[] = [
  {
    slug: 'como-conseguir-bolsa-estudo-50-faculdade',
    oldFirstPRegex: /<p>\s*Antes de sair se inscrevendo[\s\S]*?<\/p>/i,
    newFirstPHtml: `<p>Pra conseguir bolsa de 50% ou mais em faculdade particular, os 4 caminhos com maior chance são: <strong>Prouni</strong> (bolsa integral ou parcial via ENEM ≥ 450 + renda baixa), <strong>Fies</strong> (financiamento estudantil pago após formado), <strong>bolsas próprias das faculdades parceiras</strong> (até 80% de desconto, sem ENEM e sem comprovação de renda) e <strong>marketplaces agregadores de bolsa</strong>. Cada um tem critério diferente — veja como funciona abaixo.</p>`,
  },
  {
    slug: 'cursos-ead-mais-procurados-2026',
    oldFirstPRegex: /<p>\s*O ensino a dist[âa]ncia consolidou[\s\S]*?<\/p>/i,
    newFirstPHtml: `<p>Os <strong>10 cursos EAD mais procurados em 2026</strong> são: Administração, Pedagogia, Análise e Desenvolvimento de Sistemas (ADS), Recursos Humanos, Marketing, Ciências Contábeis, Logística, Gestão Financeira, Gestão de TI e Serviço Social. Todos têm mensalidades a partir de R$ 99/mês com bolsa, reconhecimento do MEC e demanda aquecida no mercado de trabalho. A seguir, o porquê de cada um liderar a busca e como conseguir bolsa em qualquer deles.</p>`,
  },
]

async function main() {
  console.log('━━━ Fix blog openings ━━━\n')
  let updated = 0
  let skipped = 0

  for (const fix of FIXES) {
    const post = await prisma.blogPost.findUnique({
      where: { slug: fix.slug },
      select: { id: true, title: true, content: true },
    })

    if (!post) {
      console.log(`  ⊘ ${fix.slug}: not found`)
      skipped++
      continue
    }

    if (!fix.oldFirstPRegex.test(post.content)) {
      console.log(`  = ${fix.slug}: already fixed (no match for old pattern)`)
      skipped++
      continue
    }

    const newContent = post.content.replace(fix.oldFirstPRegex, fix.newFirstPHtml)
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: newContent, updatedAt: new Date() },
    })
    console.log(`  ✓ ${fix.slug}: opening rewritten`)
    updated++
  }

  console.log(`\nResumo: ${updated} atualizado(s), ${skipped} pulado(s)`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
