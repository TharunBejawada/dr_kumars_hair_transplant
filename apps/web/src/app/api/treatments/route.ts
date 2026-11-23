import { NextResponse } from "next/server";
import { listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive } from "@drkumar/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || undefined;
    const all = await listTreatments(category);
    const treatments = all.filter(isTreatmentLive);
    return NextResponse.json(
      { treatments },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (e) {
    console.error("public treatments list failed", e);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}

