import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const n = x => x.toLocaleString('pt-BR')
const [tot, zeros, comAthena, athenaPos, soAthena, antigas] = await Promise.all([
  p.cityCourseOfferCache.count(),
  p.cityCourseOfferCache.count({ where: { offerCount: 0 } }),
  p.cityCourseOfferCache.count({ where: { athenaFetchedAt: { not: null } } }),
  p.cityCourseOfferCache.count({ where: { athenaOfferCount: { gt: 0 } } }),
  p.cityCourseOfferCache.count({ where: { offerCount: 0, athenaOfferCount: { gt: 0 } } }),
  p.cityCourseOfferCache.count({ where: { fetchedAt: { lt: new Date('2026-08-27') } } }),
])
console.log(`  linhas                      ${n(tot)}`)
console.log(`  medidas com Athena          ${n(comAthena)}`)
console.log(`  com oferta Athena > 0       ${n(athenaPos)}`)
console.log(`  ZERO na Cogna, mas com Athena ${n(soAthena)}   <- estavam invisíveis`)
console.log(`  ainda offerCount=0 (Cogna)  ${n(zeros)}   (eram 25.927)`)
console.log(`  ainda anteriores a 27/08    ${n(antigas)}   (eram ~30.900)`)
await p.$disconnect()
