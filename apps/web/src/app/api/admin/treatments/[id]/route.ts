import { treatmentInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import {
  deleteTreatment,
  getTreatment,
  TreatmentSlugTakenError,
  updateTreatment,
} from "@/lib/db/treatments";

export const runtime = "nodejs";

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
    return treatment ? json({ treatment }) : json({ error: "Treatment not found" }, 404);
  } catch (e) {
    if (e instanceof TreatmentSlugTakenError) {
      return json(
        { error: "Validation failed", issues: { slug: ["This URL slug is already taken by another treatment"] } },
        409,
      );
    }
    throw e;
  }
});

export const DELETE = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  await deleteTreatment((await params).id);
  return json({ ok: true });
});

