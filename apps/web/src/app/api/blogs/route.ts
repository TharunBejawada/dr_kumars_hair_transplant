import { NextResponse } from "next/server";
import { listLiveBlogs } from "@/lib/db/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public listing: only live blogs (published, or scheduled and due). No cron needed – decided at request time. */
export async function GET() {
  try {
    const blogs = (await listLiveBlogs()).map((b) => ({
      id: b.id, blogTitle: b.blogTitle, blogImage: b.blogImage, categories: b.categories, author: b.author,
      timeline: b.timeline, url: b.url, publishAt: b.publishAt, seoTitle: b.seoTitle, metaDescription: b.metaDescription,
    }));
    return NextResponse.json({ blogs }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    console.error("public blogs list failed", e);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
