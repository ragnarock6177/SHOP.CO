"use client";

import React, { useState } from "react";
import { InventoryItem, StockAdjustPayload } from "@/hooks/queries/useInventory";

export interface StockAdjustModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: StockAdjustPayload) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  item,
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [movementType, setMovementType] = useState<StockAdjustPayload["movementType"]>("PURCHASE");
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const resultingStock = item.quantityOnHand + quantityChange;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (resultingStock < 0) {
      setErrorMessage("Stock adjustment resulting balance cannot be negative.");
      return;
    }

    if (quantityChange === 0) {
      setErrorMessage("Quantity change must be non-zero.");
      return;
    }

    onSubmit({
      variantId: item.variantId,
      movementType,
      quantityChange,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">Adjust Inventory Balance</h3>
        <p className="text-xs text-slate-500">
          SKU: <span className="font-mono text-slate-800">{item.sku}</span> ({item.productName})
        </p>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-3 text-center text-xs">
          <div>
            <span className="block text-[10px] text-slate-500">On Hand</span>
            <span className="font-bold text-slate-800">{item.quantityOnHand}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500">Reserved</span>
            <span className="font-bold text-slate-500">{item.quantityReserved}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500">Available</span>
            <span className="font-bold text-emerald-400">{item.availableQuantity}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Movement Type</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
            >
              <option value="PURCHASE">PURCHASE (Stock In)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Correction)</option>
              <option value="DAMAGE">DAMAGE (Stock Out)</option>
              <option value="LOSS">LOSS (Stock Out)</option>
              <option value="RETURN">RETURN (Stock In)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Quantity Change (e.g. +50 or -5)</label>
            <input
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Resulting On Hand Balance: <span className="font-bold text-slate-800">{resultingStock}</span>
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for stock adjustment..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustModal;
