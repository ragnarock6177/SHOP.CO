"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/select";

export interface StaffFormModalProps {
  isOpen: boolean;
  roles?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  roles = [],
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      roleIds,
      isSuperAdmin,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">Provision Staff Account</h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.doe@airave.com"
              className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Temporary Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assigned Role</label>
            <CustomSelect
              value={roleIds[0] || ""}
              onChange={(val) => setRoleIds(val ? [val] : [])}
              placeholder="Select Role"
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              className="w-full"
              triggerClassName="w-full h-10 px-3.5"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="superAdmin"
              checked={isSuperAdmin}
              onChange={(e) => setIsSuperAdmin(e.target.checked)}
              className="rounded border-slate-200 bg-white text-slate-900"
            />
            <label htmlFor="superAdmin" className="text-xs text-slate-700 font-semibold">
              Grant Full Super Admin Access
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Provisioning..." : "Provision Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
