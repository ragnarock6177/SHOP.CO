"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Ticket, Plus } from "lucide-react";
import { useCoupons, useCreateCoupon, useToggleCouponStatus, CouponItem } from "../../../hooks/queries/useCoupons";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { CouponFormModal } from "../../../components/forms/CouponFormModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function CouponsPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isLoading } = useCoupons({
    page,
    limit: 10,
    search: search || undefined,
  });

  const createMutation = useCreateCoupon();
  const toggleMutation = useToggleCouponStatus();

  const handleCreateCoupon = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: ColumnDef<CouponItem>[] = [
    {
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Ticket className="h-4 w-4 text-slate-500" />
          <code className="font-mono text-xs font-bold text-slate-900 uppercase">{row.original.code}</code>
        </div>
      ),
    },
    {
      accessorKey: "discountValue",
      header: "Discount Value",
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-400">
          {row.original.discountType === "PERCENTAGE" ? `${row.original.discountValue}% OFF` : `₹${row.original.discountValue} OFF`}
        </span>
      ),
    },
    {
      accessorKey: "usedCount",
      header: "Redemptions / Limit",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">
          {row.original.usedCount} / {row.original.usageLimit ? row.original.usageLimit : "∞"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${row.original.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold" : "bg-slate-100 text-slate-500"}`}>
          {row.original.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Toggle Status",
      cell: ({ row }) => (
        <PermissionGate permission="coupons:update">
          <button
            onClick={() => toggleMutation.mutate({ id: row.original.id, isActive: !row.original.isActive })}
            disabled={toggleMutation.isPending}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {row.original.isActive ? "Deactivate" : "Activate"}
          </button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Promotional Coupons & Discounts</h1>
          <p className="text-xs text-slate-500">Configure promotional voucher codes, discount rules, and redemption limits</p>
        </div>
        <PermissionGate permission="coupons:create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        </PermissionGate>
      </div>

      <SearchInput
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Search by coupon code..."
        className="w-full sm:w-72"
      />

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />

      <CouponFormModal
        isOpen={isModalOpen}
        isLoading={createMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCoupon}
      />
    </div>
  );
}
