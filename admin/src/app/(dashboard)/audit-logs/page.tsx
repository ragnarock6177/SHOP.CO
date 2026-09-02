"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Activity, Eye } from "lucide-react";
import { useAuditLogs, AuditLogItem } from "../../../hooks/queries/useAuditLogs";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { AuditDiffModal } from "../../../components/audit/AuditDiffModal";

export default function AuditLogsPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 10,
    search: search || undefined,
  });

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <span className="font-semibold text-slate-900">{row.original.action}</span>
        </div>
      ),
    },
    {
      accessorKey: "actorName",
      header: "Actor",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.actorName}</span>,
    },
    {
      accessorKey: "entityType",
      header: "Entity Reference",
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-semibold text-slate-700 uppercase">{row.original.entityType}</span>
          <p className="text-[10px] text-slate-500">#{row.original.entityId.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Diff Payload",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedLog(row.original)}
          className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Eye className="h-3 w-3" />
          <span>View Payload</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      

      <SearchInput
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Search by action, actor, or entity ID..."
        className="w-full sm:w-72"
      />

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />

      <AuditDiffModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
