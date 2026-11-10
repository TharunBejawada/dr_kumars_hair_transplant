import { NextResponse, type NextRequest } from "next/server";
import { appointmentSchema } from "@drkumar/shared";
import { createAppointment } from "@/lib/db/appointments";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Public endpoint: create an appointment request. */
export async function POST(req: NextRequest) {
  // Same-origin only – blocks cross-site form posts.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`appt:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const parsed = appointmentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form fields and try again." }, { status: 400 });
  }
  // Honeypot tripped: pretend success so bots learn nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 201 });

  const { website: _w, ...data } = parsed.data;
  if (!process.env.APPOINTMENTS_TABLE) {
    console.error("APPOINTMENTS_TABLE is not configured");
    return NextResponse.json({ error: "Service unavailable. Please call us." }, { status: 503 });
  }
  try {
    await createAppointment(data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("appointment put failed", e);
    return NextResponse.json({ error: "Could not save your request. Please call us." }, { status: 500 });
  }
}
