import { z } from "zod";
import { json, withAdmin } from "@/lib/auth/api";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, presignImageUpload } from "@/lib/s3";

export const runtime = "nodejs";
const schema = z.object({ contentType: z.string(), size: z.number().int().positive().max(MAX_IMAGE_BYTES) });

/** Returns a short-lived presigned POST so the browser uploads the image straight to S3. */
export const POST = withAdmin(async (req) => {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !(parsed.data.contentType in IMAGE_TYPES)) {
    return json({ error: "Only JPG, PNG, WebP or GIF images up to 5 MB are allowed" }, 400);
  }
  return json(await presignImageUpload(parsed.data.contentType));
});
