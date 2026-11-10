import { NextResponse } from "next/server";
import { changePasswordSchema } from "@drkumar/shared";
import { COOKIE_NAME, cookieOptions, signSession } from "@/lib/auth/jwt";
import { json, withAdmin } from "@/lib/auth/api";
import { verifyPassword } from "@/lib/auth/password";
import { getUser, LOCK_MS, recordFailure, setPassword } from "@/lib/db/users";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export const POST = withAdmin(async (req, session) => {
  if (!rateLimit(`pw:${session.email}`, 10, 15 * 60_000)) return json({ error: "Too many attempts. Try again later." }, 429);

  const parsed = changePasswordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, 400);
  const { currentPassword, newPassword } = parsed.data;

  const user = await getUser(session.email);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.lockedUntil && user.lockedUntil > Date.now()) {
    return json({ error: `Account locked. Try again in ${Math.ceil(LOCK_MS / 60_000)} min.` }, 423);
  }
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    await recordFailure(user.email, user.failedAttempts ?? 0); // a hijacked session can't brute-force the password here
    return json({ error: "Validation failed", issues: { currentPassword: ["Current password is incorrect"] } }, 400);
  }
  if (newPassword.toLowerCase().includes(user.email.split("@")[0].toLowerCase())) {
    return json({ error: "Validation failed", issues: { newPassword: ["Password must not contain your email name"] } }, 400);
  }

  await setPassword(user.email, newPassword);
  // Every other session (older iat) is now invalid; keep this one signed in with a fresh token.
  const token = await signSession({ email: user.email, role: user.role });
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(COOKIE_NAME, token, cookieOptions);
  return res;
});
