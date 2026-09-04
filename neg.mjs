import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const r = await p.$queryRawUnsafe(`
  SELECT f.slug, c."citySlug" FROM "CityCourseOfferCache" c JOIN "FeaturedCourse" f ON f.id=c."featuredCourseId"
  WHERE c."offerCount"=0 AND c."athenaOfferCount"=0 AND c."athenaFetchedAt" IS NOT NULL
    AND COALESCE(f."trendScore",0)<60 LIMIT 2`)
for (const x of r) console.log(`${x.slug}/${x.citySlug}`)
await p.$disconnect()
