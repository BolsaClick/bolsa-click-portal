-- Fonte Athena (YDUQS: Estácio, IBMEC, Wyden) no cache de curso×cidade.
-- Aditivo e com default: linhas existentes seguem válidas, e nenhum leitor
-- atual muda de comportamento (offerCount continua sendo só Cogna).
ALTER TABLE "CityCourseOfferCache"
  ADD COLUMN "athenaOfferCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "athenaMinPrice" DOUBLE PRECISION,
  ADD COLUMN "athenaFetchedAt" TIMESTAMP(3);
