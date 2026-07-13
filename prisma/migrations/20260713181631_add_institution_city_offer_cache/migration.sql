-- Fase 4: inventário de ofertas por marca × cidade (faculdade city pages).
CREATE TABLE "InstitutionCityOfferCache" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "citySlug" TEXT NOT NULL,
    "offerCount" INTEGER NOT NULL DEFAULT 0,
    "minPrice" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionCityOfferCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InstitutionCityOfferCache_brand_citySlug_key" ON "InstitutionCityOfferCache"("brand", "citySlug");
CREATE INDEX "InstitutionCityOfferCache_citySlug_idx" ON "InstitutionCityOfferCache"("citySlug");
CREATE INDEX "InstitutionCityOfferCache_brand_idx" ON "InstitutionCityOfferCache"("brand");
CREATE INDEX "InstitutionCityOfferCache_offerCount_idx" ON "InstitutionCityOfferCache"("offerCount");
