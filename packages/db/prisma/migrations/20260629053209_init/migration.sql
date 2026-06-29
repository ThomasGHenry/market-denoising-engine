-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'PUBLISHED', 'REVIEWED', 'MUTATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('SHORT_TEXT', 'STATIC_IMAGE', 'SHORT_VIDEO', 'LONGFORM_TEXT', 'LONGFORM_VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LINKEDIN', 'X', 'YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'BLOG', 'EMAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProbeStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'REVIEWED', 'MUTATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "SignalStrength" AS ENUM ('NONE', 'WEAK', 'PROMISING', 'STRONG');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MutationType" AS ENUM ('HOOK', 'AUDIENCE', 'PAIN', 'PROMISE', 'FORMAT', 'PLATFORM', 'CTA', 'TONE', 'PROOF', 'VISUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MutationStatus" AS ENUM ('OPEN', 'DRAFTED', 'PUBLISHED', 'DONE', 'SKIPPED');

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT,
    "status" "GenerationStatus" NOT NULL DEFAULT 'DRAFT',
    "fitnessFunction" TEXT NOT NULL DEFAULT 'default_v0',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Probe" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "parentProbeId" TEXT,
    "title" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "contentText" TEXT,
    "format" "Format" NOT NULL,
    "status" "ProbeStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "effortMinutes" INTEGER NOT NULL DEFAULT 10,
    "fitnessScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Probe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPost" (
    "id" TEXT NOT NULL,
    "probeId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "url" TEXT,
    "externalId" TEXT,
    "caption" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursSincePost" INTEGER,
    "impressions" INTEGER,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "follows" INTEGER,
    "profileClicks" INTEGER,
    "linkClicks" INTEGER,
    "leads" INTEGER,
    "qualitativeScore" INTEGER,
    "notes" TEXT,

    CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalReview" (
    "id" TEXT NOT NULL,
    "probeId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signal" "SignalStrength" NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "observation" TEXT NOT NULL,
    "interpretation" TEXT NOT NULL,
    "decision" TEXT,
    "inferredAudience" TEXT,
    "inferredProblem" TEXT,
    "inferredPromise" TEXT,
    "inferredTags" TEXT[],
    "trustAligned" BOOLEAN NOT NULL DEFAULT true,
    "shouldMutate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SignalReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationReview" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "winnerProbeId" TEXT,
    "rationale" TEXT,
    "nextGenerationPlan" TEXT,

    CONSTRAINT "GenerationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mutation" (
    "id" TEXT NOT NULL,
    "sourceProbeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mutationType" "MutationType" NOT NULL,
    "status" "MutationStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mutation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Probe" ADD CONSTRAINT "Probe_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Probe" ADD CONSTRAINT "Probe_parentProbeId_fkey" FOREIGN KEY ("parentProbeId") REFERENCES "Probe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_probeId_fkey" FOREIGN KEY ("probeId") REFERENCES "Probe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricSnapshot" ADD CONSTRAINT "MetricSnapshot_platformPostId_fkey" FOREIGN KEY ("platformPostId") REFERENCES "PlatformPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalReview" ADD CONSTRAINT "SignalReview_probeId_fkey" FOREIGN KEY ("probeId") REFERENCES "Probe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationReview" ADD CONSTRAINT "GenerationReview_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mutation" ADD CONSTRAINT "Mutation_sourceProbeId_fkey" FOREIGN KEY ("sourceProbeId") REFERENCES "Probe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
