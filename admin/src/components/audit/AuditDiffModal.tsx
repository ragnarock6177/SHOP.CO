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
      <div className="w-full max-w-lg space-y-4 rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">Audit Log Payload Snapshot</h3>

        <div className="space-y-2 text-xs text-slate-700">
          <p>
            <span className="font-semibold text-slate-500">Action:</span> {log.action}
          </p>
          <p>
            <span className="font-semibold text-slate-500">Actor:</span> {log.actorName} ({log.actorId})
          </p>
          <p>
            <span className="font-semibold text-slate-500">Entity:</span> {log.entityType} (#{log.entityId})
          </p>
          <p>
            <span className="font-semibold text-slate-500">Timestamp:</span> {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Payload JSON Diff:</span>
          <pre className="max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white p-3 text-[11px] text-emerald-400">
            {log.changes ? JSON.stringify(log.changes, null, 2) : "// No change payload recorded."}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            Close Snapshot
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditDiffModal;
