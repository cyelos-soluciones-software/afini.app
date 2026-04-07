-- Freemium por defecto: 25 ciudadanos por campaña (nuevas filas; las existentes no se modifican).
ALTER TABLE "Campaign" ALTER COLUMN "maxVoters" SET DEFAULT 25;
