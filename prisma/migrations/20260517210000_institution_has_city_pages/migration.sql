-- AlterTable: gate de SEO programatic para páginas /faculdades/[slug]/[city]
ALTER TABLE "Institution"
  ADD COLUMN "hasCityPages" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Institution_hasCityPages_idx" ON "Institution"("hasCityPages");

-- Backfill: Anhanguera (139 cidades) e Unopar (162 cidades) têm presença
-- ampla no Brasil. Unime fica false (só 2 cidades).
UPDATE "Institution"
SET "hasCityPages" = true
WHERE "slug" IN ('anhanguera', 'unopar');
