import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@drkumar/shared";
import { COOKIE_NAME, cookieOptions, signSession } from "@/lib/auth/jwt";
import { json, sameOrigin } from "@/lib/auth/api";
import { dummyHash, verifyPassword } from "@/lib/auth/password";
import { ensureSeedUser, getUser, LOCK_MS, recordFailure, recordSuccess } from "@/lib/db/users";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const INVALID = "Invalid email or password";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`, 15, 10 * 60_000)) return json({ error: "Too many attempts. Try again later." }, 429);

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: INVALID }, 401);
  const { email, password } = parsed.data;

  try {
    await ensureSeedUser(email);
    const user = await getUser(email);

    if (user?.lockedUntil && user.lockedUntil > Date.now()) {
      const mins = Math.ceil((user.lockedUntil - Date.now()) / 60_000);
      return json({ error: `Account locked. Try again in ${Math.min(mins, LOCK_MS / 60_000)} min.` }, 423);
    }

    // Always run a bcrypt compare so response time doesn't reveal whether the email exists.
    const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
    if (!user || !ok) {
      if (user) await recordFailure(email, user.failedAttempts ?? 0);
      return json({ error: INVALID }, 401);
    }

    await recordSuccess(email);
    const token = await signSession({ email: user.email, role: user.role });
    const res = NextResponse.json({ ok: true, email: user.email, role: user.role }, { headers: { "Cache-Control": "no-store" } });
    res.cookies.set(COOKIE_NAME, token, cookieOptions);
    return res;
  } catch (e) {
    console.error("login error", e);
    return json({ error: "Sign-in is temporarily unavailable" }, 503);
  }
}
