"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { Truck, Plus, ExternalLink } from "lucide-react";
import { useShipments, useCreateShipment, useUpdateShipmentStatus, ShipmentItem } from "../../../hooks/queries/useFulfillment";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { CreateShipmentModal } from "../../../components/fulfillment/CreateShipmentModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";

export default function ShipmentsPage() {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isLoading } = useShipments({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const createMutation = useCreateShipment();
  const updateStatusMutation = useUpdateShipmentStatus();

  const handleCreateShipment = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: ColumnDef<ShipmentItem>[] = [
    {
      accessorKey: "trackingNumber",
      header: "Carrier & Tracking",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-slate-900">{row.original.carrier}</span>
          <div className="flex items-center space-x-1">
            <code className="text-[11px] text-slate-500 font-mono">{row.original.trackingNumber}</code>
            {row.original.trackingUrl && (
              <a
                href={row.original.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-900"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Order Reference",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="text-xs font-semibold text-slate-800 hover:underline">
          #{row.original.orderNumber || row.original.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Shipment Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Update Tracking",
      cell: ({ row }) => (
        <PermissionGate permission="fulfillment:update">
          {row.original.status !== "DELIVERED" && (
            <CustomSelect
              value=""
              placeholder="Shift Status..."
              onChange={(val) => {
                if (val) {
                  updateStatusMutation.mutate({ id: row.original.id, status: val as any });
                }
              }}
              disabled={updateStatusMutation.isPending}
              options={[
                ...(row.original.status === "PENDING"
                  ? [{ value: "SHIPPED", label: "Mark SHIPPED" }]
                  : []),
                { value: "DELIVERED", label: "Mark DELIVERED" },
              ]}
              triggerClassName="h-7 px-2.5 text-[11px] w-36"
            />
          )}
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Package Shipments & Fulfillment</h1>
          <p className="text-xs text-slate-500">Track logistics carrier status, tracking numbers, and package delivery</p>
        </div>
        <PermissionGate permission="fulfillment:create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Shipment</span>
          </button>
        </PermissionGate>
      </div>

      <div className="flex justify-end">
        <CustomSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Shipment Statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "SHIPPED", label: "Shipped" },
            { value: "DELIVERED", label: "Delivered" },
          ]}
          triggerClassName="w-44"
        />
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />

      <CreateShipmentModal
        isOpen={isModalOpen}
        isLoading={createMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateShipment}
      />
    </div>
  );
}
