-- Carrossel de banners: segmentação por site (bolsaclick | bolsamais |
-- anhanguera) e período de vigência opcional.
--
-- `targetSites` vazio = exibe em todos os sites, preservando o comportamento
-- de todo banner cadastrado antes desse campo existir.
ALTER TABLE "Banner" ADD COLUMN "targetSites" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Banner" ADD COLUMN "startsAt" TIMESTAMP(3);
ALTER TABLE "Banner" ADD COLUMN "endsAt" TIMESTAMP(3);
