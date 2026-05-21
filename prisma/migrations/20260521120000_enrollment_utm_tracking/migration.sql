-- AlterTable: add UTM tracking + UTMify dispatch flags to Enrollment
ALTER TABLE "Enrollment"
  ADD COLUMN "utmSource"           TEXT,
  ADD COLUMN "utmMedium"           TEXT,
  ADD COLUMN "utmCampaign"         TEXT,
  ADD COLUMN "utmContent"          TEXT,
  ADD COLUMN "utmTerm"             TEXT,
  ADD COLUMN "src"                 TEXT,
  ADD COLUMN "sck"                 TEXT,
  ADD COLUMN "ipAddress"           TEXT,
  ADD COLUMN "utmifyWaitingSentAt" TIMESTAMP(3),
  ADD COLUMN "utmifyPaidSentAt"    TIMESTAMP(3);
