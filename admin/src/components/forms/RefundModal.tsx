"use client";

import React, { useState } from "react";

export interface RefundModalProps {
  isOpen: boolean;
  orderId?: string;
  maxAmount?: number;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { orderId: string; amount: number; reason: string }) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  orderId = "",
  maxAmount = 0,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [targetOrderId, setTargetOrderId] = useState<string>(orderId);
  const [amount, setAmount] = useState<number>(maxAmount);
  const [reason, setReason] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      orderId: targetOrderId || orderId,
      amount,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-zinc-100">Process Transactional Refund</h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {!orderId && (
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Order ID</label>
              <input
                type="text"
                value={targetOrderId}
                onChange={(e) => setTargetOrderId(e.target.value)}
                placeholder="UUID order reference"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Refund Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Refund Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for payment gateway refund..."
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || !reason}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundModal;
