-- Aditiva: tabela nova + enum novo. Não toca em nenhuma tabela existente.

-- CreateEnum
CREATE TYPE "PartnerInscriptionResult" AS ENUM ('SUCCESS', 'REFUSED', 'ERROR');

-- CreateTable
CREATE TABLE "PartnerInscriptionOutcome" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partner" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "outcome" "PartnerInscriptionResult" NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "httpStatus" INTEGER,
    "partnerInscriptionId" TEXT,
    "alreadyEnrolled" BOOLEAN NOT NULL DEFAULT false,
    "cpf" TEXT,
    "offerId" TEXT,
    "courseName" TEXT,
    "transactionId" TEXT,
    "durationMs" INTEGER,

    CONSTRAINT "PartnerInscriptionOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerInscriptionOutcome_createdAt_idx" ON "PartnerInscriptionOutcome"("createdAt");

-- CreateIndex
CREATE INDEX "PartnerInscriptionOutcome_partner_outcome_createdAt_idx" ON "PartnerInscriptionOutcome"("partner", "outcome", "createdAt");

-- CreateIndex
CREATE INDEX "PartnerInscriptionOutcome_cpf_idx" ON "PartnerInscriptionOutcome"("cpf");
