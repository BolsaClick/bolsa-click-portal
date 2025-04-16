/*
  Warnings:

  - Made the column `cep` on table `Unidade` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Unidade" ALTER COLUMN "cep" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;
