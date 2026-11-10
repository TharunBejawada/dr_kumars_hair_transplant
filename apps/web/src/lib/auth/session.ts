import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession, type Session } from "./jwt";
import { isSessionCurrent } from "../db/users";

/** For server components / actions: current admin or null. */
export async function getSession(): Promise<Session | null> {
  const s = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  return s && (await isSessionCurrent(s).catch(() => false)) ? s : null;
}

/** For admin pages: redirect to login when not authenticated (middleware is the first gate, this is the second). */
export async function requireSessionPage(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
