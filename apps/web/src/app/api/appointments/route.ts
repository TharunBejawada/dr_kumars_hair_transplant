import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { appointmentSchema } from "@drkumar/shared";
import { db } from "@/lib/dynamo";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Public endpoint: create an appointment request. (Admin read/update endpoints will require JWT auth.) */
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

  const body = await req.json().catch(() => null);
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form fields and try again." }, { status: 400 });
  }
  // Honeypot tripped: pretend success so bots learn nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 201 });

  const { website: _w, ...data } = parsed.data;
  const item = { id: randomUUID(), ...data, status: "new", createdAt: new Date().toISOString() };

  const table = process.env.APPOINTMENTS_TABLE;
  if (!table) {
    if (process.env.NODE_ENV === "production") {
      console.error("APPOINTMENTS_TABLE is not configured");
      return NextResponse.json({ error: "Service unavailable. Please call us." }, { status: 503 });
    }
    console.log("[dev] appointment (no table configured):", item);
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    await db().send(new PutCommand({ TableName: table, Item: item }));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("appointment put failed", e);
    return NextResponse.json({ error: "Could not save your request. Please call us." }, { status: 500 });
  }
}
