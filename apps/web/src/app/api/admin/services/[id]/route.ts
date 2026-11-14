import { servicePageInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import { deleteServicePage, getServicePage, SlugTakenError, updateServicePage } from "@/lib/db/services";

export const runtime = "nodejs";

export const GET = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  const page = await getServicePage((await params).id);
  return page ? json({ page }) : json({ error: "Service page not found" }, 404);
});

export const PUT = withAdmin<{ id: string }>(async (req, _s, { params }) => {
  const body = await req.json().catch(() => null);
  const parsed = servicePageInputSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  }
  try {
    const page = await updateServicePage((await params).id, parsed.data);
    return page ? json({ page }) : json({ error: "Service page not found" }, 404);
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

export const DELETE = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  await deleteServicePage((await params).id);
  return json({ ok: true });
});

