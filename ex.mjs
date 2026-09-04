import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const r = await p.$queryRawUnsafe(`
  SELECT f.slug, c."citySlug", c."offerCount" cogna, c."athenaOfferCount" athena, COALESCE(f."trendScore",0) trend
  FROM "CityCourseOfferCache" c JOIN "FeaturedCourse" f ON f.id=c."featuredCourseId"
  WHERE c."offerCount"=0 AND c."athenaOfferCount">=2 AND COALESCE(f."trendScore",0)<60 AND f."hasCityPages"=true
  ORDER BY c."athenaOfferCount" DESC LIMIT 3`)
for (const x of r) console.log(`  /cursos/${x.slug}/${x.citySlug}   cogna=${x.cogna} athena=${x.athena} trend=${x.trend}`)
if (!r.length) console.log('  (nenhuma combinação com hasCityPages; tentando sem esse filtro)')
await p.$disconnect()
