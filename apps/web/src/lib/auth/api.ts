import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession, type Session } from "./jwt";
import { isSessionCurrent } from "../db/users";

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Same-origin check for state-changing requests (defence in depth on top of SameSite=Strict cookies). */
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return req.method === "GET" || req.method === "HEAD";
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

type Ctx<P> = { params: Promise<P> };

/** Wraps an admin API handler: verifies the JWT cookie and (for mutations) the origin on EVERY request. */
export function withAdmin<P = Record<string, string>>(
  handler: (req: NextRequest, session: Session, ctx: Ctx<P>) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: Ctx<P>) => {
    if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
    const session = await verifySession(req.cookies.get(COOKIE_NAME)?.value).catch(() => null);
    if (!session || !(await isSessionCurrent(session).catch(() => false))) return json({ error: "Unauthorized" }, 401);
    try {
      return await handler(req, session, ctx);
    } catch (e) {
      console.error("admin api error", e);
      return json({ error: "Something went wrong" }, 500);
    }
  };
}
