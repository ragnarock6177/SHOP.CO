import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#FBFBFB] flex flex-col justify-between items-center py-4 sm:py-6 px-4 sm:px-8 lg:px-12 font-be-vietnam-pro selection:bg-black selection:text-white">
      {/* Top Header Bar: Logo on Left, Back to Home on Right */}
      <header className="w-full max-w-7xl flex items-center justify-between py-3 sm:py-4">
        <Link
          href="/"
          className="flex items-center hover:opacity-85 transition-opacity py-1.5"
        >
          <Image
            src="/main_logo.png"
            alt="AIRAVÉ"
            width={160}
            height={45}
            className="h-6.5 sm:h-7.5 lg:h-8.5 w-auto object-contain shrink-0"
            priority
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border border-gray-200 text-xs sm:text-sm font-bold text-gray-800 hover:text-black hover:border-gray-400 hover:bg-gray-50 transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Centered Auth Form */}
      <main className="w-full max-w-xl my-auto py-6 sm:py-8 flex flex-col justify-center">
        {children}
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="w-full max-w-7xl text-center py-4 text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} AIRAVÉ Atelier. All rights reserved.
      </footer>
    </div>
  );
}
