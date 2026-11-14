import { NextResponse } from "next/server";
import { isServicePageLive } from "@drkumar/shared";
import { getServicePageBySlug } from "@/lib/db/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug.toLowerCase();
    const page = await getServicePageBySlug(slug);
    if (!page || !isServicePageLive(page)) {
      return NextResponse.json({ error: "Service page not found" }, { status: 404 });
    }
    return NextResponse.json(
      { page },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (e) {
    console.error("public service page failed", e);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}

