-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "closingCtaText" TEXT;

-- Eliminar duplicados por (campaña, teléfono); conserva el votante con id menor
DELETE FROM "Voter" a
USING "Voter" b
WHERE a."campaignId" = b."campaignId"
  AND a.phone = b.phone
  AND a.id > b.id;

-- CreateIndex
CREATE UNIQUE INDEX "Voter_campaignId_phone_key" ON "Voter"("campaignId", "phone");
