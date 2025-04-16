/*
  Warnings:

  - A unique constraint covering the columns `[slug,brand]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand,externalId]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Curso_externalId_key";

-- DropIndex
DROP INDEX "Curso_slug_key";

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'anhanguera';

-- CreateIndex
CREATE UNIQUE INDEX "Curso_slug_brand_key" ON "Curso"("slug", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_brand_externalId_key" ON "Curso"("brand", "externalId");
