import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/jwt";
import { json, sameOrigin } from "@/lib/auth/api";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
