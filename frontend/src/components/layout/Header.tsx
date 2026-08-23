"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";

export const Header: React.FC = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [announcementText, setAnnouncementText] = useState("Sign up and get 20% off your first order.");
  const [announcementLink, setAnnouncementLink] = useState("/signup");

  React.useEffect(() => {
    import("@/lib/settingsApi").then(({ getStorefrontSettingsApi }) => {
      getStorefrontSettingsApi().then((settings) => {
        if (settings?.header?.announcementBar) {
          if (!settings.header.announcementBar.enabled) {
            setShowAnnouncement(false);
          } else {
            if (settings.header.announcementBar.text) {
              setAnnouncementText(settings.header.announcementBar.text);
            }
            if (settings.header.announcementBar.link) {
              setAnnouncementLink(settings.header.announcementBar.link);
            }
          }
        }
      });
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-be-vietnam-pro">
      {/* Single Top Black Announcement Bar */}
      <AnimatePresence initial={false}>
        {showAnnouncement && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-black text-white"
          >
            <div className="py-2 px-7 sm:px-12 text-center text-[10px] sm:text-xs font-medium relative flex items-center justify-center min-h-[36px] sm:min-h-[40px]">
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
                onClick={() => setShowAnnouncement(false)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                aria-label="Close Announcement"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Bar */}
      <Navbar />
    </header>
  );
};
