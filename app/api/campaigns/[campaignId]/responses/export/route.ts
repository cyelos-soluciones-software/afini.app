import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { hasCampaignAccess } from "@/lib/authz";
import { buildParticipantResponsesXlsxBuffer } from "@/lib/participant-responses-export";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Descarga Excel con respuestas de participantes (sin nombre ni teléfono).
 * Solo CAMPAIGN_ADMIN o SUPER_ADMIN con acceso a la campaña.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "CAMPAIGN_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const ok = await hasCampaignAccess(session.user.id, session.user.role, campaignId);
  if (!ok) {
    return NextResponse.json({ error: "Sin acceso a esta campaña" }, { status: 403 });
  }

  try {
    const { buffer, filenameBase } = await buildParticipantResponsesXlsxBuffer(campaignId);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${filenameBase}-${stamp}.xlsx`;

    await writeAuditLog({
      userId: session.user.id,
      email: session.user.email ?? undefined,
      action: "participant_responses_export",
      entity: "Campaign",
      entityId: campaignId,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[export/responses]", e);
    return NextResponse.json({ error: "No se pudo generar el archivo" }, { status: 500 });
  }
}
