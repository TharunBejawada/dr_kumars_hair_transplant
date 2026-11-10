import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth/jwt";

/** First gate: no valid session => login page (pages) or 401 (APIs). Handlers re-verify independently. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/admin");
  const isPublicAuth = pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  if (isPublicAuth) return NextResponse.next();

  const session = await verifySession(req.cookies.get(COOKIE_NAME)?.value).catch(() => null);
  if (session) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
