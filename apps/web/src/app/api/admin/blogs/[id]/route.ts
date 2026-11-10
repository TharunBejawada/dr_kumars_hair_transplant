import { blogInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import { deleteBlog, getBlog, SlugTakenError, updateBlog } from "@/lib/db/blogs";

export const runtime = "nodejs";

export const GET = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  const blog = await getBlog((await params).id);
  return blog ? json({ blog }) : json({ error: "Not found" }, 404);
});

export const PUT = withAdmin<{ id: string }>(async (req, _s, { params }) => {
  const parsed = blogInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  try {
    const blog = await updateBlog((await params).id, parsed.data);
    return blog ? json({ blog }) : json({ error: "Not found" }, 404);
  } catch (e) {
    if (e instanceof SlugTakenError) return json({ error: "Validation failed", issues: { url: ["This URL is already used by another blog"] } }, 409);
    throw e;
  }
});

export const DELETE = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  await deleteBlog((await params).id);
  return json({ ok: true });
});
