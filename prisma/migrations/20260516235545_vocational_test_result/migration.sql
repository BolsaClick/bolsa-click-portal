-- CreateTable
CREATE TABLE "VocationalTestResult" (
    "id" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "hollandCode" TEXT NOT NULL,
    "profileData" JSONB NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocationalTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VocationalTestResult_shareToken_key" ON "VocationalTestResult"("shareToken");

-- CreateIndex
CREATE INDEX "VocationalTestResult_shareToken_idx" ON "VocationalTestResult"("shareToken");
