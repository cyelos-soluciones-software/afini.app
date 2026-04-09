/**
 * Cloudflare R2 (S3 compatible): cliente y helpers para uploads.
 * Se usa para subir imágenes de campañas (banner y foto).
 * @packageDocumentation
 */
import { S3Client } from "@aws-sdk/client-s3";

function required(name: string, v: string | undefined): string {
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

export function getR2Config() {
  const endpoint = required("R2_ENDPOINT", process.env.R2_ENDPOINT);
  const bucket = required("R2_BUCKET", process.env.R2_BUCKET);
  const publicBaseUrl = required("R2_PUBLIC_BASE_URL", process.env.R2_PUBLIC_BASE_URL).replace(/\/$/, "");
  return { endpoint, bucket, publicBaseUrl };
}

export function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT", process.env.R2_ENDPOINT),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY),
    },
  });
}

