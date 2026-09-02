"use client";

import React from "react";

export const FormSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded-md animate-shimmer bg-slate-100" />
          <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded-md animate-shimmer bg-slate-100" />
          <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-32 rounded-md animate-shimmer bg-slate-100" />
        <div className="h-28 w-full rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
      </div>
    </div>
  );
};

export default FormSkeleton;
