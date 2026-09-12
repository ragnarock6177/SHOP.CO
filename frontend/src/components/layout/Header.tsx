"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { StorefrontHeaderAnnouncementBar } from "@/types/settings";
import { DEFAULT_STOREFRONT_SETTINGS } from "@/lib/settingsApi";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  initialAnnouncement?: StorefrontHeaderAnnouncementBar;
}

export const Header: React.FC<HeaderProps> = ({ initialAnnouncement }) => {
  const { isAuthenticated, isHydrated } = useAuth();

  const defaultText =
    initialAnnouncement?.text ??
    DEFAULT_STOREFRONT_SETTINGS.header.announcementBar.text;
  const defaultLink =
    initialAnnouncement?.link ??
    DEFAULT_STOREFRONT_SETTINGS.header.announcementBar.link;
  const defaultEnabled =
    initialAnnouncement?.enabled ??
    DEFAULT_STOREFRONT_SETTINGS.header.announcementBar.enabled;

  const [announcementEnabled, setAnnouncementEnabled] = useState(defaultEnabled);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [announcementText, setAnnouncementText] = useState(defaultText);
  const [announcementLink, setAnnouncementLink] = useState(defaultLink);
  const wasAuthenticatedRef = React.useRef(isAuthenticated);

  // Controlled directly by Admin Panel Settings (announcementBar.enabled)
  const shouldShowAnnouncement = announcementEnabled && !sessionDismissed;

  const ctaLabel = useMemo(() => {
    if (!announcementLink) return null;
    if (announcementLink.includes("signup") || announcementLink.includes("register")) {
      return isAuthenticated ? "Shop Now" : "Sign Up Now";
    }
    return "Shop Now";
  }, [announcementLink, isAuthenticated]);

  React.useEffect(() => {
    if (initialAnnouncement) return; // Already provided from server

    import("@/lib/settingsApi").then(({ getStorefrontSettingsApi }) => {
      getStorefrontSettingsApi().then((settings) => {
        if (settings?.header?.announcementBar) {
          const bar = settings.header.announcementBar;
          setAnnouncementEnabled(bar.enabled);
          if (bar.text) setAnnouncementText(bar.text);
          if (bar.link) setAnnouncementLink(bar.link);
        }
      });
    });
  }, [initialAnnouncement]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-be-vietnam-pro overflow-x-clip">
      <AnimatePresence initial={false}>
        {shouldShowAnnouncement && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-black text-white w-full px-3 sm:px-8 lg:px-12"
          >
            <div className="max-w-7xl mx-auto py-2 text-center text-[10px] sm:text-xs font-medium relative flex items-center justify-center min-h-9 sm:min-h-10 px-8 sm:px-10">
              <div className="flex items-center justify-center gap-1 leading-tight flex-wrap sm:flex-nowrap max-w-full">
                <span className="opacity-90 line-clamp-2 sm:line-clamp-none">{announcementText}</span>
                {announcementLink && ctaLabel && (
                  <Link
                    href={announcementLink}
                    className="font-extrabold underline hover:text-gray-300 transition-colors whitespace-nowrap ml-1"
                  >
                    {ctaLabel}
                  </Link>
                )}
              </div>

              <button
                onClick={() => setSessionDismissed(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                aria-label="Close Announcement"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />
    </header>
  );
};
