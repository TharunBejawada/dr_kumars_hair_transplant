import { treatmentInputSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import {
  createTreatment,
  listTreatments,
  TreatmentSlugTakenError,
} from "@/lib/db/treatments";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withAdmin(async (req) => {
  const url = new URL(req.url);
  const serviceCategory = url.searchParams.get("serviceCategory") || undefined;
  const treatments = await listTreatments(serviceCategory);
  return json({ treatments });
});

export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = treatmentInputSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  }
  try {
    const treatment = await createTreatment(parsed.data);
    revalidatePath("/admin/treatments");
    revalidatePath(`/${treatment.serviceCategory}/${treatment.slug}`);
    revalidatePath(`/${treatment.serviceCategory}`);
    revalidatePath("/services");
    return json({ treatment }, 201);
  } catch (e) {
    if (e instanceof TreatmentSlugTakenError) {
      return json(
        { error: "Validation failed", issues: { slug: ["This URL slug is already taken by another treatment"] } },
        409,
      );
    }
    console.error("Failed to create treatment:", e);
    return json({ error: (e as Error).message || "Failed to create treatment" }, 500);
  }
});
