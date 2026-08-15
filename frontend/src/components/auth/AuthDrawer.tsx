"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, ArrowRight } from "lucide-react";

export interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export const AuthDrawer: React.FC<AuthDrawerProps> = ({ isOpen, onClose }) => {
  // Prevent body scrolling & enable Escape key listener when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Hardware-accelerated Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: "opacity", transform: "translateZ(0)" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            {/* Right drawer panel with 60fps hardware-accelerated cubic-bezier transition */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.32,
                ease: [0.32, 0.72, 0, 1], // iOS-style cubic-bezier curve for smooth 60fps rendering
              }}
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="w-screen max-w-md bg-white text-black flex flex-col shadow-2xl p-6 sm:p-8 overflow-y-auto z-10 pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="font-integral text-xl font-black text-black uppercase tracking-tight">
                  MY ACCOUNT
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="py-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Welcome to{" "}
                    <span className="font-bold text-black">AIRAVÉ</span>. Log in
                    to access your saved orders & wishlist, or create a new
                    account to unlock 20% off your first purchase.
                  </p>

                  {/* Primary Action Buttons (Log In & Sign Up Redirects) */}
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full transition-all shadow-md flex items-center justify-center gap-2.5 group"
                    >
                      <LogIn className="w-4 h-4 text-white" />
                      <span>Log In to Account</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/signup"
                      onClick={onClose}
                      className="w-full py-4 bg-[#F0F0F0] hover:bg-gray-200 text-black font-bold text-xs uppercase rounded-full transition-all flex items-center justify-center gap-2.5 group"
                    >
                      <UserPlus className="w-4 h-4 text-black" />
                      <span>Create New Account</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    {/* Google Sign In Option */}
                    <button
                      type="button"
                      onClick={() => alert("Google Sign-In Clicked!")}
                      className="w-full py-3.5 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all shadow-2xs mt-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                AIRAVÉ &copy; {new Date().getFullYear()}. All rights reserved.
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
