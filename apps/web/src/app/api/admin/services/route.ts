import { servicePageInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import { createServicePage, listServicePages, SlugTakenError } from "@/lib/db/services";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export const GET = withAdmin(async (req) => {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const pages = await listServicePages(category);
  return json({ pages });
});

export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = servicePageInputSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  }
  try {
    const page = await createServicePage(parsed.data);
    revalidatePath(`/${page.slug}`);
    revalidatePath("/services");
    return json({ page }, 201);
  } catch (e) {
    if (e instanceof SlugTakenError) {
      return json(
        { error: "Validation failed", issues: { slug: ["This URL slug is already taken by another service page"] } },
        409,
      );
    }
    throw e;
  }
});

