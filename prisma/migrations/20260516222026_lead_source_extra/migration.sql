-- AlterTable: cpf passa a ser opcional (leads de teste vocacional não pedem CPF)
ALTER TABLE "Lead" ALTER COLUMN "cpf" DROP NOT NULL;

-- AlterTable: adicionar source + extraData
ALTER TABLE "Lead" ADD COLUMN "source" TEXT,
ADD COLUMN "extraData" JSONB;

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");
