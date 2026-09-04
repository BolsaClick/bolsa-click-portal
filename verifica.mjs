import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const dups = ['prouni-2026-inscricao-notas-de-corte-como-usar-2026-07','desconto-em-faculdade-diferenca-prouni-fies-bolsa-direta-2026-07','bolsas-de-estudo-para-quem-ja-trabalha-opcoes-como-concorrer-2026-07','quem-foi-louis-pasteur-descobertas-medicina-2026-07']
const keep = dups.map(s => s.replace(/-2026-07$/,''))
const ativos = await p.blogPost.count({ where: { slug: { in: dups }, isActive: true } })
const sobrev = await p.blogPost.count({ where: { slug: { in: keep }, isActive: true, publishedAt: { not: null } } })
const noSitemap = await p.blogPost.count({ where: { isActive: true, publishedAt: { not: null } } })
console.log(`  duplicatas ainda ativas : ${ativos}   (esperado 0)`)
console.log(`  sobreviventes ativos    : ${sobrev}   (esperado 4)`)
console.log(`  posts no sitemap agora  : ${noSitemap}   (eram 130)`)
await p.$disconnect()
