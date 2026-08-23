"use client";

import React from "react";
import { HomepageSectionManager } from "@/components/settings/HomepageSectionManager";

export default function HomepageSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Homepage Sections</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reorder dynamic homepage sections, toggle visibility, and configure product selection modes
        </p>
      </div>

      <HomepageSectionManager />
    </div>
  );
}
