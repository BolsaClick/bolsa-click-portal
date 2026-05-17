-- AlterEnum: adicionar tipos de curso pra pós-graduação (PostgreSQL exige cada ADD VALUE em statement separado)
ALTER TYPE "CourseType" ADD VALUE IF NOT EXISTS 'ESPECIALIZACAO';
ALTER TYPE "CourseType" ADD VALUE IF NOT EXISTS 'MBA';

-- AlterTable: adicionar flags pra SEO programatic expansion
ALTER TABLE "FeaturedCourse"
  ADD COLUMN "hasCityPages" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "enrichedAt" TIMESTAMP(3),
  ADD COLUMN "enrichmentNote" TEXT;

-- CreateIndex
CREATE INDEX "FeaturedCourse_hasCityPages_idx" ON "FeaturedCourse"("hasCityPages");

-- Backfill: marcar os 20 cursos editoriais originais como elegíveis pra city pages
-- (lista hardcoded; ajustar se algum slug mudou)
UPDATE "FeaturedCourse"
SET "hasCityPages" = true
WHERE "slug" IN (
  'administracao', 'direito', 'enfermagem', 'psicologia',
  'educacao-fisica', 'farmacia', 'medicina', 'engenharia-civil',
  'pedagogia', 'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos', 'marketing',
  'nutricao', 'odontologia', 'fisioterapia', 'biomedicina',
  'ciencias-contabeis', 'arquitetura-e-urbanismo',
  'engenharia-de-producao', 'gestao-comercial'
);
