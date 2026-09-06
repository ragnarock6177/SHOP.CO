const PROTECTED_ROUTE_PREFIXES = ["/checkout", "/profile", "/orders"] as const;

const AUTH_ROUTE_PREFIXES = ["/login", "/signup"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  if (isAuthPath(path)) {
    return "/";
  }
  return path;
}

export function buildLoginUrl(redirectPath?: string): string {
  const safeRedirect = sanitizeRedirectPath(redirectPath);
  if (safeRedirect === "/") {
    return "/login";
  }
  return `/login?redirect=${encodeURIComponent(safeRedirect)}`;
}

export function buildSignupUrl(redirectPath?: string): string {
  const safeRedirect = sanitizeRedirectPath(redirectPath);
  if (safeRedirect === "/") {
    return "/signup";
  }
  return `/signup?redirect=${encodeURIComponent(safeRedirect)}`;
}
