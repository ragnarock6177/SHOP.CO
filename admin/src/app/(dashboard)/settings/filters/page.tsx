"use client";

import React, { useState, useEffect } from "react";
import { fetchAdminSettings } from "@/lib/settingsApi";
import { FilterSettingsForm } from "@/components/settings/FilterSettingsForm";
import { toast } from "@/lib/toast";

export default function FilterSettingsPage() {
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminSettings();
      setSettingsData(data);
    } catch (err) {
      toast.apiError(err, "Failed to load filter settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      

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
