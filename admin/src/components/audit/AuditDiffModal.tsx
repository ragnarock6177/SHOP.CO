"use client";

import React from "react";
import { AuditLogItem } from "@/hooks/queries/useAuditLogs";

export interface AuditDiffModalProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDiffModal: React.FC<AuditDiffModalProps> = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-zinc-100">Audit Log Payload Snapshot</h3>

        <div className="space-y-2 text-xs text-zinc-300">
          <p>
            <span className="font-semibold text-zinc-400">Action:</span> {log.action}
          </p>
          <p>
            <span className="font-semibold text-zinc-400">Actor:</span> {log.actorName} ({log.actorId})
          </p>
          <p>
            <span className="font-semibold text-zinc-400">Entity:</span> {log.entityType} (#{log.entityId})
          </p>
          <p>
            <span className="font-semibold text-zinc-400">Timestamp:</span> {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Payload JSON Diff:</span>
          <pre className="max-h-60 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-emerald-400">
            {log.changes ? JSON.stringify(log.changes, null, 2) : "// No change payload recorded."}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            Close Snapshot
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditDiffModal;
