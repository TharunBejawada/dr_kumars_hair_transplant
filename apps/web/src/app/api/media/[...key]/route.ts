import { NextResponse, type NextRequest } from "next/server";
import { Readable } from "node:stream";
import { getMedia } from "@/lib/s3";

export const runtime = "nodejs";

/** Serves blog images from the private S3 bucket (only keys under blogs/). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!/^blogs\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(key)) return new NextResponse("Not found", { status: 404 });
  try {
    const obj = await getMedia(key);
    const body = Readable.toWeb(obj.Body as Readable) as ReadableStream;
    return new NextResponse(body, {
      headers: {
        "Content-Type": obj.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
