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

  const { data, isPending, isFetching } = useAuditLogs({
    page,
    limit: 10,
    search: search || undefined,
  });

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      meta: { skeleton: "text" },
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
      meta: { skeleton: "text" },
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.actorName}</span>,
    },
    {
      accessorKey: "entityType",
      header: "Entity Reference",
      meta: { skeleton: "text-2lines" },
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
      meta: { skeleton: <div className="h-7 w-24 rounded animate-shimmer bg-slate-100 border border-slate-200/60" /> },
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
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by action, actor, or entity ID..."
          className="w-full sm:w-72"
        />
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={data?.data || []} isLoading={isPending && !data} isFetching={isFetching} embedded />

        <div className="shrink-0">
          <Pagination pagination={data?.pagination} currentPage={page} isLoading={isPending && !data} isFetching={isFetching} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <AuditDiffModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
