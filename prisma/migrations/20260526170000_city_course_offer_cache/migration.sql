-- AlterTable
ALTER TABLE "FeaturedCourse" ADD COLUMN "regionalTrends" JSONB;

-- CreateTable
CREATE TABLE "CityCourseOfferCache" (
    "id" TEXT NOT NULL,
    "featuredCourseId" TEXT NOT NULL,
    "citySlug" TEXT NOT NULL,
    "offerCount" INTEGER NOT NULL DEFAULT 0,
    "minPrice" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CityCourseOfferCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CityCourseOfferCache_featuredCourseId_citySlug_key" ON "CityCourseOfferCache"("featuredCourseId", "citySlug");

-- CreateIndex
CREATE INDEX "CityCourseOfferCache_citySlug_idx" ON "CityCourseOfferCache"("citySlug");

-- CreateIndex
CREATE INDEX "CityCourseOfferCache_featuredCourseId_idx" ON "CityCourseOfferCache"("featuredCourseId");

-- CreateIndex
CREATE INDEX "CityCourseOfferCache_offerCount_idx" ON "CityCourseOfferCache"("offerCount");
