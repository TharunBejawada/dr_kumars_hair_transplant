import { blogInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import { createBlog, listBlogs, SlugTakenError } from "@/lib/db/blogs";

export const runtime = "nodejs";

export const GET = withAdmin(async () => json({ blogs: await listBlogs() }));

export const POST = withAdmin(async (req) => {
  const parsed = blogInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  try {
    return json({ blog: await createBlog(parsed.data) }, 201);
  } catch (e) {
    if (e instanceof SlugTakenError) return json({ error: "Validation failed", issues: { url: ["This URL is already used by another blog"] } }, 409);
    throw e;
  }
});
