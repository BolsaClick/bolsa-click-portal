-- CreateEnum
CREATE TYPE "PriceIndexScope" AS ENUM ('NATIONAL', 'COURSE', 'CITY', 'STATE', 'BRAND');

-- CreateTable
CREATE TABLE "PriceIndexSnapshot" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,
    "courseCityRows" INTEGER NOT NULL,
    "institutionCityRows" INTEGER NOT NULL,
    "stalestFetchedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "PriceIndexSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceIndexEntry" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "scope" "PriceIndexScope" NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "offersCount" INTEGER NOT NULL,
    "citiesCovered" INTEGER NOT NULL,
    "minPrice" DOUBLE PRECISION,
    "avgMinPrice" DOUBLE PRECISION,

    CONSTRAINT "PriceIndexEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceIndexSnapshot_period_idx" ON "PriceIndexSnapshot"("period");

-- CreateIndex
CREATE INDEX "PriceIndexSnapshot_capturedAt_idx" ON "PriceIndexSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "PriceIndexEntry_snapshotId_idx" ON "PriceIndexEntry"("snapshotId");

-- CreateIndex
CREATE INDEX "PriceIndexEntry_scope_scopeKey_idx" ON "PriceIndexEntry"("scope", "scopeKey");

-- CreateIndex
CREATE UNIQUE INDEX "PriceIndexEntry_snapshotId_scope_scopeKey_key" ON "PriceIndexEntry"("snapshotId", "scope", "scopeKey");

-- AddForeignKey
ALTER TABLE "PriceIndexEntry" ADD CONSTRAINT "PriceIndexEntry_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PriceIndexSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
