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

  // Defer auth-based visibility until after hydration so SSR and client match.
  const shouldShowAnnouncement = useMemo(() => {
    if (!isHydrated) return false;
    if (!announcementEnabled || sessionDismissed) return false;
    if (isAuthenticated) return false;
    return true;
  }, [isHydrated, announcementEnabled, sessionDismissed, isAuthenticated]);

  React.useEffect(() => {
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
  }, []);

  React.useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      setSessionDismissed(false);
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-be-vietnam-pro">
      <AnimatePresence initial={false}>
        {shouldShowAnnouncement && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-black text-white"
          >
            <div className="py-2 px-7 sm:px-12 text-center text-[10px] sm:text-xs font-medium relative flex items-center justify-center min-h-9 sm:min-h-10">
              <div className="flex items-center justify-center gap-1 leading-tight flex-wrap sm:flex-nowrap">
                <span className="opacity-90">{announcementText}</span>
                {announcementLink && (
                  <Link
                    href={announcementLink}
                    className="font-extrabold underline hover:text-gray-300 transition-colors whitespace-nowrap ml-1"
                  >
                    Sign Up Now
                  </Link>
                )}
              </div>

              <button
                onClick={() => setSessionDismissed(true)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
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
