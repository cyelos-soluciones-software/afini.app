-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "maxVoters" INTEGER NOT NULL DEFAULT 50;

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");
