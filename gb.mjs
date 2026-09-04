import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const n = x => x.toLocaleString('pt-BR')
// Gate: index se offerCount >= 2, OU (trendScore >= 60 E offerCount >= 1)
const rows = await p.$queryRawUnsafe(`
  SELECT c."offerCount" cogna, c."athenaOfferCount" athena, c."athenaFetchedAt" IS NOT NULL medida,
         COALESCE(f."trendScore",0) trend
  FROM "CityCourseOfferCache" c JOIN "FeaturedCourse" f ON f.id = c."featuredCourseId"`)
const idx = (o, t) => o >= 2 || (t >= 60 && o >= 1)
let antes=0, depois=0, viram=0, semAthena=0
for (const r of rows) {
  const a = idx(r.cogna, Number(r.trend))
  const d = idx(r.cogna + r.athena, Number(r.trend))
  if (a) antes++; if (d) depois++; if (!a && d) viram++
  if (!r.medida) semAthena++
}
console.log(`  linhas                         ${n(rows.length)}`)
console.log(`  indexáveis HOJE (só Cogna)     ${n(antes)}`)
console.log(`  indexáveis com Cogna+Athena    ${n(depois)}`)
console.log(`  >>> VIRAM noindex → index      ${n(viram)}`)
console.log(`  ainda sem Athena medida        ${n(semAthena)}  (entram nas próximas rodadas)`)
await p.$disconnect()
