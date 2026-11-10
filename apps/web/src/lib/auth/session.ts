import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession, type Session } from "./jwt";

/** For server components / actions: current admin or null. */
export async function getSession(): Promise<Session | null> {
  return verifySession((await cookies()).get(COOKIE_NAME)?.value);
}

/** For admin pages: redirect to login when not authenticated (middleware is the first gate, this is the second). */
export async function requireSessionPage(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
