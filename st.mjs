import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const n = x => x.toLocaleString('pt-BR')
const [tot, comAthena, antigas, athenaPos] = await Promise.all([
  p.cityCourseOfferCache.count(),
  p.cityCourseOfferCache.count({ where: { athenaFetchedAt: { not: null } } }),
  p.cityCourseOfferCache.count({ where: { fetchedAt: { lt: new Date('2026-08-28') } } }),
  p.cityCourseOfferCache.count({ where: { athenaOfferCount: { gt: 0 } } }),
])
const rows = await p.$queryRawUnsafe(`
  SELECT c."offerCount" cogna, c."athenaOfferCount" athena, COALESCE(f."trendScore",0) trend
  FROM "CityCourseOfferCache" c JOIN "FeaturedCourse" f ON f.id=c."featuredCourseId"`)
const idx = (o,t) => o>=2 || (t>=60 && o>=1)
let indexaveis=0
for (const r of rows) if (idx(r.cogna + r.athena, Number(r.trend))) indexaveis++
console.log(`  medidas com Athena     ${n(comAthena)} de ${n(tot)}  (${Math.round(comAthena/tot*100)}%)`)
console.log(`  com oferta Athena > 0  ${n(athenaPos)}`)
console.log(`  linhas ainda pré-28/08 ${n(antigas)}   <- as que venciam domingo`)
console.log(`  páginas INDEXÁVEIS     ${n(indexaveis)}   (eram 45.658 só com Cogna)`)
await p.$disconnect()
