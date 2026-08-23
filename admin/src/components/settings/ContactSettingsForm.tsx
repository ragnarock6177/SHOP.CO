"use client";

import React, { useState } from "react";
import { ContactSettings } from "@/types/settings";
import { updateContactSettings } from "@/lib/settingsApi";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

interface ContactSettingsFormProps {
  initialData?: ContactSettings;
  onSaved?: () => void;
}

export function ContactSettingsForm({ initialData, onSaved }: ContactSettingsFormProps) {
  const [formData, setFormData] = useState<ContactSettings>({
    phone: initialData?.phone || "+91 98765 43210",
    secondaryPhone: initialData?.secondaryPhone || "",
    email: initialData?.email || "concierge@airave.com",
    supportEmail: initialData?.supportEmail || "support@airave.com",
    whatsapp: initialData?.whatsapp || "+919876543210",
    address: initialData?.address || "104 Atelier Boulevard, Fashion District",
    city: initialData?.city || "Mumbai",
    state: initialData?.state || "Maharashtra",
    country: initialData?.country || "India",
    postalCode: initialData?.postalCode || "400001",
    workingHours: initialData?.workingHours || "Mon - Sat: 10:00 AM - 8:00 PM IST",
    googleMapsUrl: initialData?.googleMapsUrl || "https://maps.google.com/?q=Airave",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: keyof ContactSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateContactSettings(formData);
      setMessage({ type: "success", text: "Contact information saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update contact settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">Contact Information Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Centralize concierge numbers, support emails, physical atelier address, and business hours</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
            Primary Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            type="text"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="secondaryPhone" className="text-xs font-semibold text-slate-700">
            Secondary Phone (Optional)
          </label>
          <input
            id="secondaryPhone"
            type="text"
            value={formData.secondaryPhone}
            onChange={(e) => handleChange("secondaryPhone", e.target.value)}
            placeholder="+91 98765 43211"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-slate-700">
            Concierge Primary Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="concierge@airave.com"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="supportEmail" className="text-xs font-semibold text-slate-700">
            Support Email
          </label>
          <input
            id="supportEmail"
            type="email"
            value={formData.supportEmail}
            onChange={(e) => handleChange("supportEmail", e.target.value)}
            placeholder="support@airave.com"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="whatsapp" className="text-xs font-semibold text-slate-700">
            WhatsApp Hotline
          </label>
          <input
            id="whatsapp"
            type="text"
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="+919876543210"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="workingHours" className="text-xs font-semibold text-slate-700">
            Working Hours <span className="text-rose-500">*</span>
          </label>
          <input
            id="workingHours"
            type="text"
            value={formData.workingHours}
            onChange={(e) => handleChange("workingHours", e.target.value)}
            placeholder="Mon - Sat: 10:00 AM - 8:00 PM IST"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="address" className="text-xs font-semibold text-slate-700">
          Physical Address <span className="text-rose-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="104 Atelier Boulevard, Fashion District"
          className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="city" className="text-xs font-semibold text-slate-700">City</label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Mumbai"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="state" className="text-xs font-semibold text-slate-700">State</label>
          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="Maharashtra"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="country" className="text-xs font-semibold text-slate-700">Country</label>
          <input
            id="country"
            type="text"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            placeholder="India"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="postalCode" className="text-xs font-semibold text-slate-700">Postal Code</label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            placeholder="400001"
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="googleMapsUrl" className="text-xs font-semibold text-slate-700">
          Google Maps Embed / Pin Link
        </label>
        <input
          id="googleMapsUrl"
          type="text"
          value={formData.googleMapsUrl}
          onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
          placeholder="https://maps.google.com/?q=Airave"
          className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
        />
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Contact Information"}</span>
        </button>
      </div>
    </form>
  );
}
