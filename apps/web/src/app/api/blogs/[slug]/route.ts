import { NextResponse } from "next/server";
import { isBlogLive } from "@drkumar/shared";
import { getBlogByUrl } from "@/lib/db/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const blog = await getBlogByUrl((await params).slug.toLowerCase());
    // Unpublished, scheduled-in-the-future, draft and inactive blogs are indistinguishable from "not found".
    if (!blog || !isBlogLive(blog)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    console.error("public blog failed", e);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
