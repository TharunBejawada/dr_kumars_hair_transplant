import { treatmentInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import {
  deleteTreatment,
  getTreatment,
  TreatmentSlugTakenError,
  updateTreatment,
} from "@/lib/db/treatments";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  const treatment = await getTreatment((await params).id);
  return treatment ? json({ treatment }) : json({ error: "Treatment not found" }, 404);
});

export const PUT = withAdmin<{ id: string }>(async (req, _s, { params }) => {
  const body = await req.json().catch(() => null);
  const parsed = treatmentInputSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  }
  try {
    const treatment = await updateTreatment((await params).id, parsed.data);
    if (!treatment) return json({ error: "Treatment not found" }, 404);
    revalidatePath("/admin/treatments");
    revalidatePath(`/${treatment.serviceCategory}/${treatment.slug}`);
    revalidatePath(`/${treatment.serviceCategory}`);
    revalidatePath("/services");
    return json({ treatment });
  } catch (e) {
    if (e instanceof TreatmentSlugTakenError) {
      return json(
        { error: "Validation failed", issues: { slug: ["This URL slug is already taken by another treatment"] } },
        409,
      );
    }
    console.error("Failed to update treatment:", e);
    return json({ error: (e as Error).message || "Failed to update treatment" }, 500);
  }
});

export const DELETE = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  const id = (await params).id;
  const existing = await getTreatment(id);
  await deleteTreatment(id);
  revalidatePath("/admin/treatments");
  if (existing?.slug) {
    revalidatePath(`/${existing.serviceCategory}/${existing.slug}`);
    revalidatePath(`/${existing.serviceCategory}`);
  }
  revalidatePath("/services");
  return json({ ok: true });
});
