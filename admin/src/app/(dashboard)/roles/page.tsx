"use client";

import React, { useState } from "react";
import { Shield, Plus } from "lucide-react";
import { useRoles, useCreateRole, useUpdateRolePermissions, RoleItem } from "../../../hooks/queries/useAdminUsers";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

const AVAILABLE_PERMISSIONS = [
  "dashboard:read",
  "products:read",
  "products:create",
  "products:update",
  "products:delete",
  "categories:read",
  "categories:create",
  "categories:update",
  "collections:read",
  "collections:create",
  "collections:update",
  "attributes:read",
  "attributes:create",
  "inventory:read",
  "inventory:adjust",
  "customers:read",
  "customers:update",
  "orders:read",
  "orders:update_status",
  "fulfillment:read",
  "fulfillment:create",
  "fulfillment:update",
  "payments:read",
  "coupons:read",
  "coupons:create",
  "coupons:update",
  "reviews:read",
  "reviews:publish",
  "reviews:delete",
  "returns:read",
  "returns:update",
  "refunds:process",
  "staff:read",
  "staff:create",
  "roles:read",
  "roles:manage",
  "audit_logs:read",
  "settings:read",
  "settings:update",
];

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRoleDesc, setNewRoleDesc] = useState<string>("");

  const updatePermissionsMutation = useUpdateRolePermissions();
  const createRoleMutation = useCreateRole();

  const handleRoleSelect = (role: RoleItem) => {
    setSelectedRole(role);
    setActivePermissions(role.permissions || []);
  };

  const handleTogglePermission = (perm: string) => {
    if (activePermissions.includes(perm)) {
      setActivePermissions(activePermissions.filter((p) => p !== perm));
    } else {
      setActivePermissions([...activePermissions, perm]);
    }
  };

  const handleSavePermissions = () => {
    if (selectedRole) {
      updatePermissionsMutation.mutate({
        roleId: selectedRole.id,
        permissions: activePermissions,
      });
    }
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate(
      { name: newRoleName, description: newRoleDesc, permissions: [] },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setNewRoleName("");
          setNewRoleDesc("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-56 rounded-md animate-shimmer bg-slate-100" />
            <div className="h-3.5 w-72 rounded-md animate-shimmer bg-slate-100" />
          </div>
          <div className="h-9 w-28 rounded-md animate-shimmer bg-slate-100" />
        </div>
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
          <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
          <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
          <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Roles & Permission Matrix</h1>
          <p className="text-xs text-slate-500">Configure access control levels and granular domain permissions</p>
        </div>
        <PermissionGate permission="roles:manage">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Role</span>
          </button>
        </PermissionGate>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">Defined Staff Roles</h2>
          <div className="space-y-2">
            {roles?.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`cursor-pointer rounded-md border p-3 text-xs transition ${
                  selectedRole?.id === role.id
                    ? "border-slate-400 bg-slate-100 text-slate-900"
                    : "border-slate-200/80 bg-white/60 text-slate-500 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{role.name}</span>
                  {role.isSystem && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">SYSTEM</span>
                  )}
                </div>
                {role.description && <p className="mt-1 text-[11px] text-slate-500">{role.description}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 lg:col-span-2">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Permissions for #{selectedRole.name}</h2>
                  <p className="text-[11px] text-slate-500">Toggle permissions granted to staff assigned to this role</p>
                </div>
                <PermissionGate permission="roles:manage">
                  <button
                    onClick={handleSavePermissions}
                    disabled={updatePermissionsMutation.isPending}
                    className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                  >
                    {updatePermissionsMutation.isPending ? "Saving..." : "Save Matrix"}
                  </button>
                </PermissionGate>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[500px] overflow-y-auto pr-2">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = activePermissions.includes(perm);
                  return (
                    <label
                      key={perm}
                      className={`flex items-center space-x-2.5 rounded-md border p-2.5 text-xs transition cursor-pointer ${
                        isChecked
                          ? "border-emerald-800/80 bg-emerald-50/20 text-emerald-700"
                          : "border-slate-200/80 bg-white/60 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm)}
                        className="rounded border-slate-200 bg-white text-slate-900"
                      />
                      <span className="text-[11px]">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-slate-500">
              <Shield className="mb-2 h-8 w-8 text-slate-500" />
              Select a role from the left list to inspect and edit permission matrix.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900">Create Custom Staff Role</h3>
            <form onSubmit={handleCreateRoleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Catalog Manager"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Manages product listings and inventory balances"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending || !newRoleName}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                >
                  {createRoleMutation.isPending ? "Creating..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
