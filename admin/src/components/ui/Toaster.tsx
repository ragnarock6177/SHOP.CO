"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
        error: <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />,
        info: <Info className="h-4 w-4 text-slate-800 shrink-0" />,
        loading: <Loader2 className="h-4 w-4 text-slate-600 animate-spin shrink-0" />,
      }}
      toastOptions={{
        style: {
          fontFamily: "var(--font-be-vietnam), system-ui, sans-serif",
        },
        classNames: {
          toast:
            "group font-sans flex items-start sm:items-center gap-3 p-3.5 rounded-lg border border-slate-200/90 bg-white text-slate-900 shadow-xl text-xs font-medium backdrop-blur-md transition-all",
          title: "text-xs font-bold text-slate-900",
          description: "text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5",
          actionButton:
            "bg-slate-900 text-white font-semibold text-[11px] px-2.5 py-1 rounded-md hover:bg-slate-800 transition",
          cancelButton:
            "bg-slate-100 text-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-md hover:bg-slate-200 transition",
          closeButton:
            "border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition shadow-xs",
          success:
            "border-emerald-200 bg-emerald-50/80 text-slate-900",
          error:
            "border-rose-200 bg-rose-50/80 text-slate-900",
          warning:
            "border-amber-200 bg-amber-50/80 text-slate-900",
          info:
            "border-slate-200 bg-slate-50/90 text-slate-900",
        },
      }}
    />
  );
}

export default Toaster;
