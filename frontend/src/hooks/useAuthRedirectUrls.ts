"use client";

import { usePathname } from "next/navigation";
import { buildLoginUrl, buildSignupUrl, isAuthPath } from "@/lib/routeGuard";

export function useAuthRedirectUrls() {
  const pathname = usePathname();
  const returnPath = isAuthPath(pathname) ? undefined : pathname;

  return {
    loginUrl: buildLoginUrl(returnPath),
    signupUrl: buildSignupUrl(returnPath),
  };
}
