import { appointmentUpdateSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";
import { deleteAppointment, updateAppointment } from "@/lib/db/appointments";

export const runtime = "nodejs";

export const PATCH = withAdmin<{ id: string }>(async (req, _s, { params }) => {
  const parsed = appointmentUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid data" }, 400);
  try {
    return json({ appointment: await updateAppointment((await params).id, parsed.data) });
  } catch (e) {
    if ((e as { name?: string }).name === "ConditionalCheckFailedException") return json({ error: "Not found" }, 404);
    throw e;
  }
});

export const DELETE = withAdmin<{ id: string }>(async (_req, _s, { params }) => {
  await deleteAppointment((await params).id);
  return json({ ok: true });
});
