"use client";

import React, { useState } from "react";

export interface OrderCancelModalProps {
  isOpen: boolean;
  orderNumber: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string) => void;
}

export const OrderCancelModal: React.FC<OrderCancelModalProps> = ({
  isOpen,
  orderNumber,
  isLoading = false,
  onClose,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancel(reason || "Admin requested order cancellation");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-red-400">Cancel Order #{orderNumber}</h3>
        <p className="text-xs text-zinc-400">
          Cancelling an order is irreversible and will automatically release held stock items back to inventory on hand.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Cancellation Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer request or out-of-stock items..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderCancelModal;
