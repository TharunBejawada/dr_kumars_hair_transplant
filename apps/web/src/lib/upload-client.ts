/** Inferred MIME types based on common extensions (fallback for Windows / mobile pickers) */
function inferMimeType(fileName: string, rawType?: string): string {
  const norm = (rawType || "").toLowerCase().trim();
  if (norm && norm !== "application/octet-stream") {
    if (norm === "image/jpg" || norm === "image/pjpeg" || norm === "image/jfif") return "image/jpeg";
    if (norm === "image/x-png") return "image/png";
    return norm;
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "jfif":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/jpeg";
  }
}

/** Fallback helper: uploads directly through server route if direct-to-S3 is blocked or fails */
async function uploadViaServerFallback(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/uploads/direct", {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Server upload failed. Please try a different image.");
  }
  return data.publicPath as string;
}

/**
 * Uploads an image.
 * Primary method: Fast presigned POST directly from browser to S3.
 * Automatic fallback: Server-side proxy upload if direct S3 PUT/POST fails due to CORS, network, or policy.
 */
export async function uploadImage(file: File): Promise<string> {
  const contentType = inferMimeType(file.name, file.type);

  try {
    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, size: file.size }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // If presign fails with specific validation error, try direct fallback
      return await uploadViaServerFallback(file);
    }

    const form = new FormData();
    Object.entries(data.fields as Record<string, string>).forEach(([k, v]) => form.append(k, v));
    form.append("file", file); // Must be last

    const up = await fetch(data.url, { method: "POST", body: form });

    if (!up.ok) {
      const errText = await up.text().catch(() => "");
      const msgMatch = errText.match(/<Message>(.*?)<\/Message>/i);
      const codeMatch = errText.match(/<Code>(.*?)<\/Code>/i);
      const s3Msg = msgMatch?.[1] || codeMatch?.[1];
      console.warn("Direct S3 presigned upload returned error:", s3Msg || up.statusText, "Trying fallback...");
      return await uploadViaServerFallback(file);
    }

    return data.publicPath as string;
  } catch (err) {
    console.warn("Direct upload exception, trying fallback:", err);
    return await uploadViaServerFallback(file);
  }
}
