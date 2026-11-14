import { NextResponse } from "next/server";
import { listLiveServicePages } from "@/lib/db/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || undefined;
    const pages = await listLiveServicePages(category);
    return NextResponse.json(
      { pages },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (e) {
    console.error("public services list failed", e);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}

