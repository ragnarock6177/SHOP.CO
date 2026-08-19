"use client";

import React, { useState } from "react";

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
      <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-zinc-100">Create Package Shipment</h3>

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
            <label className="block text-zinc-300 font-semibold mb-1">Logistics Carrier</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
            >
              <option value="FedEx">FedEx</option>
              <option value="Bluedart">Bluedart Express</option>
              <option value="Delhivery">Delhivery</option>
              <option value="DHL">DHL Express</option>
              <option value="DTDC">DTDC</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. FDX-994827104"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Tracking URL (Optional)</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://track.fedex.com/..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
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
              disabled={isLoading || !trackingNumber}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
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
