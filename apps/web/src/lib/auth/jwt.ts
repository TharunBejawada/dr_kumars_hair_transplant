import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "dk_admin";
export const SESSION_SECONDS = 8 * 60 * 60;

export interface Session {
  email: string;
  role: "superadmin" | "admin";
}

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set (min 32 characters)");
  return new TextEncoder().encode(s);
}

export async function signSession(s: Session) {
  return new SignJWT({ role: s.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.email)
    .setIssuer("drkumar-web")
    .setAudience("drkumar-admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret());
}

/** Returns the session or null for any invalid / expired / tampered token. */
export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "drkumar-web",
      audience: "drkumar-admin",
    });
    if (!payload.sub || (payload.role !== "superadmin" && payload.role !== "admin")) return null;
    return { email: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
};
