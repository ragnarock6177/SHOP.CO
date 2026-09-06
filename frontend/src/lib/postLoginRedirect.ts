import { sanitizeRedirectPath } from "@/lib/routeGuard";

const RETURN_URL_KEY = "airave_return_url";

export function persistReturnUrl(url: string): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeRedirectPath(url);
  if (safe !== "/") {
    sessionStorage.setItem(RETURN_URL_KEY, safe);
  }
}

export function peekReturnUrl(): string | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(RETURN_URL_KEY);
  return stored ? sanitizeRedirectPath(stored) : null;
}

export function clearReturnUrl(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RETURN_URL_KEY);
}

export function resolveReturnUrl(queryRedirect?: string | null): string {
  const fromQuery = sanitizeRedirectPath(queryRedirect);
  if (fromQuery !== "/") {
    return fromQuery;
  }

  const stored = peekReturnUrl();
  if (stored && stored !== "/") {
    return stored;
  }

  return "/";
}

export function navigateAfterLogin(destination: string): void {
  if (typeof window === "undefined") return;
  const safeDestination = sanitizeRedirectPath(destination);
  clearReturnUrl();
  window.location.assign(safeDestination);
}
