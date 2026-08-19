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
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Roles & Permission Matrix</h1>
          <p className="text-xs text-zinc-400">Configure access control levels and granular domain permissions</p>
        </div>
        <PermissionGate permission="roles:manage">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Role</span>
          </button>
        </PermissionGate>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800 pb-3">Defined Staff Roles</h2>
          <div className="space-y-2">
            {roles?.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`cursor-pointer rounded-lg border p-3 text-xs transition ${
                  selectedRole?.id === role.id
                    ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">{role.name}</span>
                  {role.isSystem && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">SYSTEM</span>
                  )}
                </div>
                {role.description && <p className="mt-1 text-[11px] text-zinc-500">{role.description}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-4 lg:col-span-2">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Permissions for #{selectedRole.name}</h2>
                  <p className="text-[11px] text-zinc-400">Toggle permissions granted to staff assigned to this role</p>
                </div>
                <PermissionGate permission="roles:manage">
                  <button
                    onClick={handleSavePermissions}
                    disabled={updatePermissionsMutation.isPending}
                    className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
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
                      className={`flex items-center space-x-2.5 rounded-lg border p-2.5 text-xs transition cursor-pointer ${
                        isChecked
                          ? "border-emerald-800/80 bg-emerald-950/20 text-emerald-300"
                          : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm)}
                        className="rounded border-zinc-800 bg-zinc-900 text-zinc-100"
                      />
                      <span className="font-mono text-[11px]">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-zinc-500">
              <Shield className="mb-2 h-8 w-8 text-zinc-600" />
              Select a role from the left list to inspect and edit permission matrix.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100">Create Custom Staff Role</h3>
            <form onSubmit={handleCreateRoleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Catalog Manager"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Manages product listings and inventory balances"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending || !newRoleName}
                  className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
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
