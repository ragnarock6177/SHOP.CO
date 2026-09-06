import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/authSession";
import { buildLoginUrl, isAuthPath, isProtectedPath, sanitizeRedirectPath } from "@/lib/routeGuard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isProtectedPath(pathname)) {
    if (!token) {
      const loginUrl = new URL(buildLoginUrl(pathname), request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAuthPath(pathname) && token) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const destination = sanitizeRedirectPath(redirect);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/profile/:path*", "/orders/:path*", "/login", "/signup"],
};
