"use client";

import React, { useState, useEffect } from "react";
import { fetchAdminSettings } from "@/lib/settingsApi";
import { FilterSettingsForm } from "@/components/settings/FilterSettingsForm";

export default function FilterSettingsPage() {
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminSettings();
      setSettingsData(data);
    } catch (err) {
      console.warn("Failed to load filter settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Shop Catalog Filters</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure storefront catalog filter facets, price bounds, color swatches, sizes, and dress style categories
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400 shadow-2xs animate-pulse">
          Loading Filter Settings...
        </div>
      ) : (
        <FilterSettingsForm initialData={settingsData.filters} onSaved={loadSettings} />
      )}
    </div>
  );
}
