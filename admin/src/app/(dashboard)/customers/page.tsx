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

export default function CustomersPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const columns: ColumnDef<CustomerItem>[] = [
    {
      accessorKey: "email",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-zinc-100">
            {row.original.firstName || row.original.lastName
              ? `${row.original.firstName || ""} ${row.original.lastName || ""}`.trim()
              : "Registered Customer"}
          </span>
          <p className="text-[11px] text-zinc-400">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-zinc-400">{row.original.phone || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Account Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "isEmailVerified",
      header: "Verified",
      cell: ({ row }) => (
        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${row.original.isEmailVerified ? "bg-emerald-950 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>
          {row.original.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <PermissionGate permission="customers:read">
          <Link
            href={`/customers/${row.original.id}`}
            className="flex items-center space-x-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Eye className="h-3 w-3" />
            <span>Profile</span>
          </Link>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Customer Accounts</h1>
          <p className="text-xs text-zinc-400">Search customer profiles, address books, and account status</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
