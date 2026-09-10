export const AUTH_COOKIE_NAME = "airave_access_token";
export const AUTH_SESSION_ISSUED_AT_KEY = "accessTokenIssuedAt";
export const AUTH_SESSION_MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000; // 8 days
export const AUTH_COOKIE_MAX_AGE_SECONDS = 8 * 24 * 60 * 60; // 8 days

export class AuthSessionError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthSessionError";
    this.status = status;
  }
}

export function syncAuthCookie(token: string | null): void {
  if (typeof document === "undefined") return;

  if (!token) {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function readAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function readAuthSessionIssuedAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_SESSION_ISSUED_AT_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isAuthSessionExpired(issuedAt = readAuthSessionIssuedAt()): boolean {
  if (!issuedAt) return false;
  return Date.now() - issuedAt >= AUTH_SESSION_MAX_AGE_MS;
}

export function persistAuthSession(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  localStorage.setItem(AUTH_SESSION_ISSUED_AT_KEY, String(Date.now()));
  syncAuthCookie(token);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem(AUTH_SESSION_ISSUED_AT_KEY);
  syncAuthCookie(null);
}

export function markAuthSessionIssuedNow(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_SESSION_ISSUED_AT_KEY, String(Date.now()));
}
