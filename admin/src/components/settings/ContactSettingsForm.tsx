"use client";

import React, { useState } from "react";
import { ContactSettings } from "@/types/settings";
import { updateContactSettings } from "@/lib/settingsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Contact Information Settings</CardTitle>
          <CardDescription>Centralize phone numbers, emails, physical atelier address, and support hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-3 text-xs font-semibold rounded-md ${
                message.type === "success"
                  ? "bg-slate-100 text-slate-900 border border-slate-300"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Primary Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone (Optional)</Label>
              <Input
                id="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={(e) => handleChange("secondaryPhone", e.target.value)}
                placeholder="+91 98765 43211"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Primary Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="concierge@airave.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                placeholder="support@airave.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Hotline</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="+919876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">Working Hours</Label>
              <Input
                id="workingHours"
                value={formData.workingHours}
                onChange={(e) => handleChange("workingHours", e.target.value)}
                placeholder="Mon - Sat: 10:00 AM - 8:00 PM IST"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="104 Atelier Boulevard, Fashion District"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Mumbai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="Maharashtra"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="India"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="400001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
            <Input
              id="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
              placeholder="https://maps.google.com/?q=Airave"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-slate-800">
            {saving ? "Saving..." : "Save Contact Information"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
