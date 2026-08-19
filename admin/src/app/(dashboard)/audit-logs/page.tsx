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
        <span className="text-[11px] text-zinc-400">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-zinc-400" />
          <span className="font-semibold text-zinc-100">{row.original.action}</span>
        </div>
      ),
    },
    {
      accessorKey: "actorName",
      header: "Actor",
      cell: ({ row }) => <span className="text-xs text-zinc-300">{row.original.actorName}</span>,
    },
    {
      accessorKey: "entityType",
      header: "Entity Reference",
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-semibold text-zinc-300 uppercase">{row.original.entityType}</span>
          <p className="text-[10px] text-zinc-500 font-mono">#{row.original.entityId.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Diff Payload",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedLog(row.original)}
          className="flex items-center space-x-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-zinc-300 transition hover:bg-zinc-800"
        >
          <Eye className="h-3 w-3" />
          <span>View Payload</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">System Audit Logs Stream</h1>
        <p className="text-xs text-zinc-400">Immutable record of admin actions, status shifts, and entity mutations</p>
      </div>

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

      <Pagination pagination={data?.pagination} onPageChange={(p) => setPage(p)} />

      <AuditDiffModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
