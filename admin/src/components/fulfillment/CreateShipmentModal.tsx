"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/select";

export interface CreateShipmentModalProps {
  isOpen: boolean;
  orderId?: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { orderId: string; carrier: string; trackingNumber: string; trackingUrl?: string }) => void;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  orderId = "",
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [carrier, setCarrier] = useState<string>("FedEx");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [trackingUrl, setTrackingUrl] = useState<string>("");
  const [targetOrderId, setTargetOrderId] = useState<string>(orderId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      orderId: targetOrderId || orderId,
      carrier,
      trackingNumber,
      trackingUrl: trackingUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">Create Package Shipment</h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {!orderId && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Order ID</label>
              <input
                type="text"
                value={targetOrderId}
                onChange={(e) => setTargetOrderId(e.target.value)}
                placeholder="UUID order reference"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Logistics Carrier</label>
            <CustomSelect
              value={carrier}
              onChange={(val) => setCarrier(val)}
              options={[
                { value: "FedEx", label: "FedEx" },
                { value: "Bluedart", label: "Bluedart Express" },
                { value: "Delhivery", label: "Delhivery" },
                { value: "DHL", label: "DHL Express" },
                { value: "DTDC", label: "DTDC" },
              ]}
              className="w-full"
              triggerClassName="w-full h-10 px-3.5"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. FDX-994827104"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tracking URL (Optional)</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://track.fedex.com/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
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
              disabled={isLoading || !trackingNumber}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Dispatching..." : "Dispatch Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipmentModal;
