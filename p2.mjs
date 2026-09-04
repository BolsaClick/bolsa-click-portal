import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const [tot, comAthena, comOferta, zeros, antigas] = await Promise.all([
  p.cityCourseOfferCache.count(),
  p.cityCourseOfferCache.count({ where: { athenaFetchedAt: { not: null } } }),
  p.cityCourseOfferCache.count({ where: { athenaOfferCount: { gt: 0 } } }),
  p.cityCourseOfferCache.count({ where: { offerCount: 0 } }),
  p.cityCourseOfferCache.count({ where: { fetchedAt: { lt: new Date('2026-08-27') } } }),
])
console.log(`  medidas com Athena   ${comAthena.toLocaleString('pt-BR')} de ${tot.toLocaleString('pt-BR')}`)
console.log(`  com oferta Athena>0  ${comOferta.toLocaleString('pt-BR')}  (${Math.round(comOferta/Math.max(comAthena,1)*100)}% das medidas)`)
console.log(`  ainda offerCount=0   ${zeros.toLocaleString('pt-BR')}   (eram 25.927)`)
console.log(`  ainda antes de 27/08 ${antigas.toLocaleString('pt-BR')}   (eram ~30.900)`)
await p.$disconnect()
