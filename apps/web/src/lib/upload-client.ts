/** Uploads an image straight to S3 using a presigned POST from our API. Returns the public path to store. */
export async function uploadImage(file: File): Promise<string> {
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  const form = new FormData();
  Object.entries(data.fields as Record<string, string>).forEach(([k, v]) => form.append(k, v));
  form.append("file", file); // must be last
  const up = await fetch(data.url, { method: "POST", body: form });
  if (!up.ok) throw new Error("Upload failed");
  return data.publicPath as string;
}
