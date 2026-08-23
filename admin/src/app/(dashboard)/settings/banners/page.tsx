"use client";

import React from "react";
import { BannerManager } from "@/components/settings/BannerManager";

export default function BannersSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hero & Campaign Banners</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage promotional hero carousel slides, campaign poster graphics, scheduling, and click destinations
        </p>
      </div>

      <BannerManager />
    </div>
  );
}
