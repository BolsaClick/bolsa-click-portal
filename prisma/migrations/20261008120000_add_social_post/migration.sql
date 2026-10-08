-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM');

-- CreateEnum
CREATE TYPE "SocialFormat" AS ENUM ('OFERTA', 'CARROSSEL_EDUCATIVO', 'NOTICIA', 'PROVA_SOCIAL');

-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'INSTAGRAM',
    "format" "SocialFormat" NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "slides" JSONB NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "ctaUrl" TEXT,
    "altText" TEXT,
    "imageUrls" TEXT[],
    "sourceRef" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "igMediaId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialPost_status_scheduledFor_idx" ON "SocialPost"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "SocialPost_format_createdAt_idx" ON "SocialPost"("format", "createdAt");

-- CreateIndex
CREATE INDEX "SocialPost_sourceRef_publishedAt_idx" ON "SocialPost"("sourceRef", "publishedAt");

