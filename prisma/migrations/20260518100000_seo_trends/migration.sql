-- CreateEnum
CREATE TYPE "TrendsSource" AS ENUM ('CURATED', 'COURSE_CATALOG', 'INSTITUTION_CATALOG');

-- CreateEnum
CREATE TYPE "GapMatchStatus" AS ENUM ('GAP', 'PARTIAL', 'COVERED');

-- CreateTable
CREATE TABLE "SeoTrendsSnapshot" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "source" "TrendsSource" NOT NULL,
    "timeframe" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'BR',
    "rawData" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoTrendsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoTrendsEntry" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "trendValue" INTEGER NOT NULL,
    "isRising" BOOLEAN NOT NULL DEFAULT false,
    "risingPercent" INTEGER,
    "matchStatus" "GapMatchStatus" NOT NULL,
    "matchedEntities" TEXT[],
    "priorityScore" DOUBLE PRECISION NOT NULL,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoTrendsEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoTrendsSnapshot_topic_idx" ON "SeoTrendsSnapshot"("topic");

-- CreateIndex
CREATE INDEX "SeoTrendsSnapshot_fetchedAt_idx" ON "SeoTrendsSnapshot"("fetchedAt");

-- CreateIndex
CREATE INDEX "SeoTrendsEntry_snapshotId_idx" ON "SeoTrendsEntry"("snapshotId");

-- CreateIndex
CREATE INDEX "SeoTrendsEntry_matchStatus_idx" ON "SeoTrendsEntry"("matchStatus");

-- CreateIndex
CREATE INDEX "SeoTrendsEntry_priorityScore_idx" ON "SeoTrendsEntry"("priorityScore");

-- CreateIndex
CREATE INDEX "SeoTrendsEntry_dismissed_idx" ON "SeoTrendsEntry"("dismissed");

-- CreateIndex
CREATE INDEX "SeoTrendsEntry_normalizedQuery_idx" ON "SeoTrendsEntry"("normalizedQuery");

-- AddForeignKey
ALTER TABLE "SeoTrendsEntry" ADD CONSTRAINT "SeoTrendsEntry_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "SeoTrendsSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
