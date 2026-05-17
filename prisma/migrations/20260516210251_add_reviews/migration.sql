-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "rating" INTEGER NOT NULL,
    "recommends" BOOLEAN NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "rejectReason" TEXT,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "responderEmail" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewVerificationToken" (
    "token" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewVerificationToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "InstitutionResponderEmail" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionResponderEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionResponseToken" (
    "token" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionResponseToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "Review_institutionId_status_idx" ON "Review"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Review_authorEmail_idx" ON "Review"("authorEmail");

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewVerificationToken_reviewId_idx" ON "ReviewVerificationToken"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewVerificationToken_email_idx" ON "ReviewVerificationToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionResponderEmail_institutionId_email_key" ON "InstitutionResponderEmail"("institutionId", "email");

-- CreateIndex
CREATE INDEX "InstitutionResponderEmail_email_idx" ON "InstitutionResponderEmail"("email");

-- CreateIndex
CREATE INDEX "InstitutionResponseToken_reviewId_idx" ON "InstitutionResponseToken"("reviewId");

-- CreateIndex
CREATE INDEX "InstitutionResponseToken_email_idx" ON "InstitutionResponseToken"("email");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVerificationToken" ADD CONSTRAINT "ReviewVerificationToken_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionResponderEmail" ADD CONSTRAINT "InstitutionResponderEmail_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionResponseToken" ADD CONSTRAINT "InstitutionResponseToken_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
