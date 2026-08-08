import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

/**
 * Gates every route behind the shared password.
 *
 * The matcher below excludes /login and static assets; everything else
 * requires a valid session cookie.
 */
/** Paths that must never be gated, or the site cannot be signed into at all. */
const PUBLIC_PATHS = ["/login", "/api/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Belt and braces. The matcher below already excludes these, but a matcher
  // that silently stops excluding /login turns this file into an infinite
  // redirect loop that locks everyone out — including whoever has to fix it.
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;

  // Fail closed. If the deployment is misconfigured, the correct behaviour is
  // to let nobody in, not to let everybody in.
  if (!secret || !process.env.SITE_PASSWORD) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "unconfigured");
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifyToken(token, secret)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  // Remember where they were headed so login can send them back.
  const from = request.nextUrl.pathname + request.nextUrl.search;
  if (from && from !== "/") url.searchParams.set("from", from);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Everything except the login page, the login API, framework assets and
     * static files.
     *
     * Every alternative here must be a single path segment with NO slash in
     * it. A slash inside this negative lookahead breaks how the pattern is
     * compiled, the exclusions stop working, and /login starts redirecting to
     * itself forever. That is why this reads `api` and `_next` rather than
     * `api/login` and `_next/static`.
     */
    "/((?!login|api|_next|favicon.ico|robots.txt).*)",
  ],
};
