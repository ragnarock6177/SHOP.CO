export const AUTH_COOKIE_NAME = "airave_access_token";
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

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
