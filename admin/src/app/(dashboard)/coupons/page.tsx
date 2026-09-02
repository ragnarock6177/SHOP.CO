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

  const { data, isPending, isFetching } = useCoupons({
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
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Ticket className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-900 uppercase">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: "discountValue",
      header: "Discount Value",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-400">
          {row.original.discountType === "PERCENTAGE" ? `${row.original.discountValue}% OFF` : `₹${row.original.discountValue} OFF`}
        </span>
      ),
    },
    {
      accessorKey: "usedCount",
      header: "Redemptions / Limit",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">
          {row.original.usedCount} / {row.original.usageLimit ? row.original.usageLimit : "∞"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${row.original.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold" : "bg-slate-100 text-slate-500"}`}>
          {row.original.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Toggle Status",
      meta: { skeleton: <div className="h-7 w-[72px] rounded animate-shimmer bg-slate-100 border border-slate-200/60" /> },
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
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by coupon code..."
          className="w-full sm:w-72"
        />
        <PermissionGate permission="coupons:create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] h-9"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        </PermissionGate>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={data?.data || []} isLoading={isPending && !data} isFetching={isFetching} embedded />

        <div className="shrink-0">
          <Pagination pagination={data?.pagination} currentPage={page} isLoading={isPending && !data} isFetching={isFetching} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <CouponFormModal
        isOpen={isModalOpen}
        isLoading={createMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCoupon}
      />
    </div>
  );
}
