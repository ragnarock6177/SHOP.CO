"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not override anchor hash navigation (e.g. #brands)
    if (window.location.hash) return;

    // Reset scroll directly to the absolute top of the document
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
