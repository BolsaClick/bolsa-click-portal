-- Data de nascimento do lead. O formulário de checkout sempre pediu, mas o
-- dado ia só no payload de inscrição da Cogna/Athena e era descartado do nosso
-- lado. DATE (não TIMESTAMP): é data pura, sem hora e sem fuso.
ALTER TABLE "Lead" ADD COLUMN "birthDate" DATE;
