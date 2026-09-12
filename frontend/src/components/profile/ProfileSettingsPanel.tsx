"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  changePasswordApi,
  getUserProfileApi,
  mapProfileToAuthUser,
  updateUserProfileApi,
  type UpdateUserProfileInput,
  type UserProfile,
} from "@/lib/userApi";

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

function SettingsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-gray-100" />
        <div className="h-16 rounded-2xl bg-gray-100" />
      </div>
      <div className="h-16 rounded-2xl bg-gray-100" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-gray-100" />
        <div className="h-16 rounded-2xl bg-gray-100" />
      </div>
      <div className="h-24 rounded-2xl bg-gray-100" />
      <div className="h-10 w-36 rounded-full bg-gray-100" />
    </div>
  );
}

export function ProfileSettingsPanel() {
  const { token, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [smsDeliveryUpdates, setSmsDeliveryUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [orderEmailUpdates, setOrderEmailUpdates] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const applyProfileToForm = (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    setFirstName(nextProfile.firstName ?? "");
    setLastName(nextProfile.lastName ?? "");
    setPhone(nextProfile.phone ?? "");
    setProfileImage(nextProfile.profileImage ?? "");
    setGender(nextProfile.gender ?? "");
    setDateOfBirth(nextProfile.dateOfBirth ?? "");
    setSmsDeliveryUpdates(nextProfile.smsDeliveryUpdates);
    setPromotionalEmails(nextProfile.promotionalEmails);
    setOrderEmailUpdates(nextProfile.orderEmailUpdates);
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getUserProfileApi(token)
      .then((data) => {
        if (!cancelled) {
          applyProfileToForm(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load profile");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const payload: UpdateUserProfileInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || null,
      phone: phone.trim() || null,
      profileImage: profileImage.trim() || null,
      gender: (gender || null) as UpdateUserProfileInput["gender"],
      dateOfBirth: dateOfBirth || null,
      smsDeliveryUpdates,
      promotionalEmails,
      orderEmailUpdates,
    };

    setIsSaving(true);
    try {
      const updated = await updateUserProfileApi(token, payload);
      applyProfileToForm(updated);
      localStorage.setItem("user", JSON.stringify(mapProfileToAuthUser(updated)));
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !profile?.hasPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePasswordApi(token, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F4F4F4] px-6 py-10 text-center text-sm text-gray-500">
        Unable to load your account settings right now.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleProfileSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Add your mobile number"
              className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-gray-100 rounded-full px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
            Profile Image URL
          </label>
          <input
            type="url"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://example.com/your-photo.jpg"
            className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] px-4 py-3 text-[11px] text-gray-500 space-y-1">
          <p>
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            Email status: {profile.emailVerifiedAt ? "Verified" : "Not verified"} · Phone status:{" "}
            {profile.phoneVerifiedAt ? "Verified" : "Not verified"}
          </p>
        </div>

        <div className="pt-1 border-t border-gray-100 space-y-2">
          <h3 className="font-bold text-xs text-black uppercase">Notification Preferences</h3>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 font-medium">
            <input
              type="checkbox"
              checked={smsDeliveryUpdates}
              onChange={(e) => setSmsDeliveryUpdates(e.target.checked)}
              className="accent-black rounded"
            />
            <span>Receive SMS delivery status updates</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 font-medium">
            <input
              type="checkbox"
              checked={promotionalEmails}
              onChange={(e) => setPromotionalEmails(e.target.checked)}
              className="accent-black rounded"
            />
            <span>Receive promotional emails and special discount codes</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 font-medium">
            <input
              type="checkbox"
              checked={orderEmailUpdates}
              onChange={(e) => setOrderEmailUpdates(e.target.checked)}
              className="accent-black rounded"
            />
            <span>Receive order confirmation and shipping email updates</span>
          </label>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase rounded-full transition-all shadow-md cursor-pointer disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>

      {profile.hasPassword && (
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4 border-t border-gray-100 pt-5"
        >
          <h3 className="font-bold text-xs text-black uppercase">Change Password</h3>

          <div>
            <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-black text-black hover:bg-black hover:text-white font-extrabold text-xs uppercase rounded-full transition-all cursor-pointer disabled:opacity-60"
          >
            {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      )}
    </div>
  );
}
