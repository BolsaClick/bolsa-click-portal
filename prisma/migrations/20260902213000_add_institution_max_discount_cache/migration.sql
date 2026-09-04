-- CreateTable
CREATE TABLE "InstitutionMaxDiscountCache" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "maxDiscountPct" INTEGER NOT NULL,
    "offersWithDiscount" INTEGER NOT NULL DEFAULT 0,
    "sampleSize" INTEGER NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionMaxDiscountCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionMaxDiscountCache_brand_key" ON "InstitutionMaxDiscountCache"("brand");

-- CreateIndex
CREATE INDEX "InstitutionMaxDiscountCache_brand_idx" ON "InstitutionMaxDiscountCache"("brand");
