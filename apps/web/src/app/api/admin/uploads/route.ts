import { z } from "zod";
import { json, withAdmin } from "@/lib/auth/api";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, presignImageUpload } from "@/lib/s3";

export const runtime = "nodejs";
const schema = z.object({
  contentType: z.string(),
  size: z.number().int().positive().max(MAX_IMAGE_BYTES),
});

/** Returns a short-lived presigned POST so the browser uploads the image straight to S3. */
export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Only JPG, PNG, WebP, GIF, or AVIF images up to 15 MB are allowed" }, 400);
  }
  const normType = parsed.data.contentType.toLowerCase().trim();
  if (!(normType in IMAGE_TYPES)) {
    return json(
      { error: `Unsupported image format (${parsed.data.contentType}). Allowed: JPG, PNG, WebP, GIF, AVIF, SVG.` },
      400
    );
  }
  try {
    const data = await presignImageUpload(normType);
    return json(data);
  } catch (err) {
    return json({ error: (err as Error).message || "Failed to create upload URL" }, 500);
  }
});
