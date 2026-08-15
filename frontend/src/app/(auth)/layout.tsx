import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-100px)] py-10 sm:py-14">
      <div className="absolute top-4 left-8 sm:top-6 sm:left-12 lg:left-50 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black transition-all group bg-white border border-gray-200 hover:border-gray-300 rounded-full px-4 py-2.5 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      {children}
    </div>
  );
}
