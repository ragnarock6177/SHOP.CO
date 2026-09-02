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
      <div className="w-full max-w-md space-y-4 rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-rose-600">Cancel Order #{orderNumber}</h3>
        <p className="text-xs text-slate-500">
          Cancelling an order is irreversible and will automatically release held stock items back to inventory on hand.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Cancellation Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer request or out-of-stock items..."
              className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason}
              className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
