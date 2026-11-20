import { json, withAdmin } from "@/lib/auth/api";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, uploadDirectMedia } from "@/lib/s3";

export const runtime = "nodejs";

/**
 * Direct server-side upload fallback if browser-to-S3 presigned POST fails
 * (e.g., due to client network firewall, ad-blockers, or CORS policies).
 */
export const POST = withAdmin(async (req) => {
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return json({ error: "Invalid form data" }, 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return json({ error: "No file provided" }, 400);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return json({ error: "File size exceeds the 15 MB limit" }, 400);
  }

  // Infer MIME type
  let contentType = (file.type || "").toLowerCase().trim();
  const extFromFileName = file.name.split(".").pop()?.toLowerCase();

  if (!contentType || !IMAGE_TYPES[contentType]) {
    if (extFromFileName === "jpg" || extFromFileName === "jpeg" || extFromFileName === "jfif") {
      contentType = "image/jpeg";
    } else if (extFromFileName === "png") {
      contentType = "image/png";
    } else if (extFromFileName === "webp") {
      contentType = "image/webp";
    } else if (extFromFileName === "gif") {
      contentType = "image/gif";
    } else if (extFromFileName === "avif") {
      contentType = "image/avif";
    } else if (extFromFileName === "svg") {
      contentType = "image/svg+xml";
    }
  }

  if (!IMAGE_TYPES[contentType]) {
    return json({ error: `Unsupported image format (${file.type || extFromFileName}). Allowed: JPG, PNG, WebP, GIF, AVIF.` }, 400);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadDirectMedia(buffer, contentType, extFromFileName);
    return json(result);
  } catch (err) {
    console.error("Direct S3 upload failed:", err);
    return json({ error: (err as Error).message || "Direct upload to storage failed" }, 500);
  }
});
