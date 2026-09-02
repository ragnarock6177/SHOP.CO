"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Plus, ShieldAlert } from "lucide-react";
import { useStaffUsers, useCreateStaffUser, useRoles, StaffUserItem } from "../../../hooks/queries/useAdminUsers";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { StaffFormModal } from "../../../components/forms/StaffFormModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function StaffUsersPage() {
  const [page, setPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: staffData, isLoading } = useStaffUsers({ page, limit: 10 });
  const { data: roles } = useRoles();
  const createMutation = useCreateStaffUser();

  const handleCreateStaff = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: ColumnDef<StaffUserItem>[] = [
    {
      accessorKey: "email",
      header: "Staff Member",
      meta: { skeleton: "text-2lines" },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <UserCheck className="h-4 w-4 text-slate-500" />
          <div>
            <span className="font-semibold text-slate-900">
              {row.original.firstName || row.original.lastName
                ? `${row.original.firstName || ""} ${row.original.lastName || ""}`.trim()
                : row.original.email}
            </span>
            <p className="text-[11px] text-slate-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isSuperAdmin",
      header: "Access Level",
      meta: { skeleton: "badge" },
      cell: ({ row }) => (
        <div>
          {row.original.isSuperAdmin ? (
            <span className="inline-flex items-center space-x-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-900">
              <ShieldAlert className="h-3 w-3 text-slate-700" />
              <span>SUPER ADMIN</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              {row.original.roles?.map((r) => r.name).join(", ") || "Standard Staff"}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {row.original.lastLoginAt ? new Date(row.original.lastLoginAt).toLocaleString() : "Never"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 shrink-0">
        <PermissionGate permission="staff:create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Provision Staff</span>
          </button>
        </PermissionGate>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={staffData?.data || []} isLoading={isLoading} embedded />

        <div className="shrink-0">
          <Pagination pagination={staffData?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <StaffFormModal
        isOpen={isModalOpen}
        roles={roles || []}
        isLoading={createMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
}
