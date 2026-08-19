import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#FBFBFB] flex flex-col justify-between items-center py-4 sm:py-6 px-4 font-be-vietnam-pro selection:bg-black selection:text-white">
      {/* Top Header Bar: Logo & Back to Home */}
      <header className="w-full max-w-md flex items-center justify-between py-2">
        <Link
          href="/"
          className="font-be-vietnam-pro-black text-xl font-black text-black tracking-tight uppercase"
        >
          AIRAVÉ
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200/80 text-[11px] font-bold text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Centered Auth Form */}
      <main className="w-full max-w-md my-auto py-4 flex flex-col justify-center">
        {children}
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="w-full max-w-md text-center py-2 text-[11px] text-gray-400 font-medium">
        © {new Date().getFullYear()} AIRAVÉ Atelier. All rights reserved.
      </footer>
    </div>
  );
}
