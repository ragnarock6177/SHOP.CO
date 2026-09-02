"use client";

import React, { useState, useEffect } from "react";
import { fetchAdminSettings } from "@/lib/settingsApi";
import { ContactSettingsForm } from "@/components/settings/ContactSettingsForm";

export default function ContactSettingsPage() {
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminSettings();
      setSettingsData(data);
    } catch (err) {
      console.warn("Failed to load settings:", err);
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
        <h1 className="text-xl font-bold text-slate-900">Contact Details</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Centralize concierge phone numbers, support emails, physical atelier address, and business hours
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400 shadow-2xs animate-pulse">
          Loading Contact Details...
        </div>
      ) : (
        <ContactSettingsForm initialData={settingsData.contact} onSaved={loadSettings} />
      )}
    </div>
  );
}
