"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Star, Trash2 } from "lucide-react";
import { useReviews, useToggleReviewPublish, useDeleteReview, ReviewItem } from "../../../hooks/queries/useReviews";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { ConfirmDialog } from "../../../components/feedback/ConfirmDialog";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function ReviewsPage() {
  const [page, setPage] = useState<number>(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isPending, isFetching } = useReviews({ page, limit: 10 });
  const toggleMutation = useToggleReviewPublish();
  const deleteMutation = useDeleteReview();

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const columns: ColumnDef<ReviewItem>[] = [
    {
      accessorKey: "rating",
      header: "Rating",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < row.original.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      accessorKey: "comment",
      header: "Review Details",
      meta: { skeleton: "text-2lines" },
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-slate-800">{row.original.title || "Review"}</span>
          <p className="text-[11px] text-slate-500 line-clamp-2">{row.original.comment}</p>
          <span className="text-[10px] text-slate-500">By {row.original.customerName} ({row.original.customerEmail})</span>
        </div>
      ),
    },
    {
      accessorKey: "isVerifiedPurchase",
      header: "Verified",
      meta: { skeleton: "badge" },
      cell: ({ row }) => (
        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${row.original.isVerifiedPurchase ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold" : "bg-slate-100 text-slate-500"}`}>
          {row.original.isVerifiedPurchase ? "VERIFIED" : "UNVERIFIED"}
        </span>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Publication",
      meta: { skeleton: "badge" },
      cell: ({ row }) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${row.original.isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold" : "bg-slate-100 text-slate-500"}`}>
          {row.original.isPublished ? "PUBLISHED" : "HIDDEN"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { skeleton: <div className="flex items-center space-x-2"><div className="h-7 w-17 rounded animate-shimmer bg-slate-100 border border-slate-200/60" /><div className="h-7 w-7 rounded animate-shimmer bg-slate-100 border border-slate-200/60" /></div> },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <PermissionGate permission="reviews:publish">
            <button
              onClick={() => toggleMutation.mutate({ id: row.original.id, isPublished: !row.original.isPublished })}
              disabled={toggleMutation.isPending}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {row.original.isPublished ? "Unpublish" : "Publish"}
            </button>
          </PermissionGate>
          <PermissionGate permission="reviews:delete">
            <button
              onClick={() => setDeleteId(row.original.id)}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={data?.data || []} isLoading={isPending && !data} isFetching={isFetching} embedded />

        <div className="shrink-0">
          <Pagination pagination={data?.pagination} currentPage={page} isLoading={isPending && !data} isFetching={isFetching} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Customer Review"
        description="Are you sure you want to delete this product review? This action cannot be undone."
        isDestructive
        isLoading={deleteMutation.isPending}
        confirmLabel="Delete Review"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
