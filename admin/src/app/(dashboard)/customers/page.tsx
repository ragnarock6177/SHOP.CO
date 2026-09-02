"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { Users, Eye } from "lucide-react";
import { useCustomers, CustomerItem } from "../../../hooks/queries/useCustomers";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PermissionGate } from "../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";

export default function CustomersPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isPending, isFetching } = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const columns: ColumnDef<CustomerItem>[] = [
    {
      accessorKey: "email",
      header: "Customer",
      meta: { skeleton: "text-2lines" },
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-slate-900">
            {row.original.firstName || row.original.lastName
              ? `${row.original.firstName || ""} ${row.original.lastName || ""}`.trim()
              : "Registered Customer"}
          </span>
          <p className="text-[11px] text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: { skeleton: "text" },
      cell: ({ row }) => <span className="text-slate-500">{row.original.phone || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Account Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "isEmailVerified",
      header: "Verified",
      meta: { skeleton: "badge" },
      cell: ({ row }) => (
        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${row.original.isEmailVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold" : "bg-slate-100 text-slate-500"}`}>
          {row.original.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { skeleton: <div className="h-7 w-19 rounded animate-shimmer bg-slate-100 border border-slate-200/60" /> },
      cell: ({ row }) => (
        <PermissionGate permission="customers:read">
          <Link
            href={`/customers/${row.original.id}`}
            className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Eye className="h-3 w-3" />
            <span>Profile</span>
          </Link>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by customer name, email, or phone..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center space-x-2">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Account Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "SUSPENDED", label: "Suspended" },
              { value: "BLOCKED", label: "Blocked" },
            ]}
            triggerClassName="w-44"
          />
        </div>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={data?.data || []} isLoading={isPending && !data} isFetching={isFetching} embedded />

        <div className="shrink-0">
          <Pagination pagination={data?.pagination} currentPage={page} isLoading={isPending && !data} isFetching={isFetching} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
}
