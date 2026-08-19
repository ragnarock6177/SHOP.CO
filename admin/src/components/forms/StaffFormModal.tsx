"use client";

import React, { useState } from "react";

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
      <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-zinc-100">Provision Staff Account</h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.doe@airave.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Temporary Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Assigned Role</label>
            <select
              onChange={(e) => setRoleIds(e.target.value ? [e.target.value] : [])}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="superAdmin"
              checked={isSuperAdmin}
              onChange={(e) => setIsSuperAdmin(e.target.checked)}
              className="rounded border-zinc-800 bg-zinc-950 text-zinc-100"
            />
            <label htmlFor="superAdmin" className="text-xs text-zinc-300 font-semibold">
              Grant Full Super Admin Access
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
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
