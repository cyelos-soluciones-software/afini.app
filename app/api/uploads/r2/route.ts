import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { hasCampaignAccess } from "@/lib/authz";
import { getR2Client, getR2Config } from "@/lib/r2";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extForType(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "bin";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "CAMPAIGN_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { campaignId?: string; kind?: "banner" | "photo"; contentType?: string; size?: number }
    | null;
  if (!body?.campaignId || !body.kind || !body.contentType || typeof body.size !== "number") {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (!ALLOWED.has(body.contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }
  if (body.size <= 0 || body.size > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 400 });
  }

  const allowed = await hasCampaignAccess(session.user.id, role, body.campaignId);
  if (!allowed) {
    return NextResponse.json({ error: "Sin acceso a esta campaña" }, { status: 403 });
  }

  const { bucket, publicBaseUrl } = getR2Config();
  const client = getR2Client();
  const ext = extForType(body.contentType);
  const key = `campaigns/${body.campaignId}/${body.kind}-${crypto.randomUUID()}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: body.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });
  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 60 });
  const publicUrl = `${publicBaseUrl}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl, key });
}

