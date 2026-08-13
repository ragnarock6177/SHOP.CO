"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { AuthDrawer } from "../auth/AuthDrawer";

export const Header: React.FC = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        {/* Top Black Announcement Bar with Slide-Down Entrance Animation */}
        <AnimatePresence initial={true}>
          {showAnnouncement && (
            <motion.div
              initial={{ y: "-100%", opacity: 0, height: 0 }}
              animate={{ y: 0, opacity: 1, height: "auto" }}
              exit={{ y: "-100%", opacity: 0, height: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-black text-white"
            >
              <div className="py-2.5 px-4 text-center text-xs sm:text-sm font-normal relative flex items-center justify-center">
                <div className="flex items-center gap-1">
                  <span>Sign up and get 20% off to your first order.</span>
                  <Link
                    href="/signup"
                    className="font-medium underline hover:text-gray-300 transition-colors ml-1"
                  >
                    Sign Up Now
                  </Link>
                </div>
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors p-1"
                  aria-label="Close Announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation */}
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      </header>

      {/* Auth Drawer Modal */}
      <AuthDrawer isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
