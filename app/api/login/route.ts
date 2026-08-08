import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createToken,
  timingSafeEqual,
} from "@/lib/auth";

/**
 * The only API route in this project.
 *
 * Checks the submitted password against SITE_PASSWORD and, on success, sets a
 * signed session cookie. The password is never written into the cookie and
 * never leaves the server.
 */
export async function POST(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!sitePassword || !secret) {
    return NextResponse.redirect(
      new URL("/login?error=unconfigured", request.url),
      { status: 303 },
    );
  }

  const form = await request.formData();
  const submitted = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "/");

  if (!timingSafeEqual(submitted, sitePassword)) {
    return NextResponse.redirect(new URL("/login?error=wrong", request.url), {
      status: 303,
    });
  }

  // Only ever redirect to a path on this site. Without this check, a crafted
  // ?from=https://example.com would turn the login form into an open redirect.
  const target = from.startsWith("/") && !from.startsWith("//") ? from : "/";

  const response = NextResponse.redirect(new URL(target, request.url), {
    status: 303,
  });

  response.cookies.set(SESSION_COOKIE, await createToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
