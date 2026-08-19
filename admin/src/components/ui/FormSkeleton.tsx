"use client";

import React from "react";

export const FormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="h-9 w-full rounded-lg bg-zinc-900" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="h-9 w-full rounded-lg bg-zinc-900" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-zinc-800" />
        <div className="h-24 w-full rounded-lg bg-zinc-900" />
      </div>
    </div>
  );
};

export default FormSkeleton;
