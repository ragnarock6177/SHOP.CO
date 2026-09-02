"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { useProducts, useArchiveProduct, ProductItem } from "../../../hooks/queries/useProducts";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../../components/feedback/ConfirmDialog";
import { PermissionGate } from "../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";
import { CreateProductModal } from "../../../components/forms/CreateProductModal";

function getProductPrimaryImage(product: ProductItem): string | null {
  const images =
    (product as ProductItem & { displayImages?: ProductItem["images"] }).displayImages ||
    product.images ||
    [];

  const primaryImage = images.find((image) => image.isPrimary);
  if (primaryImage?.imageUrl) return primaryImage.imageUrl;

  const sortedImage = [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  if (sortedImage?.imageUrl) return sortedImage.imageUrl;

  return product.primaryImage ?? null;
}

const PRODUCT_THUMB_PX = 44;

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const archiveMutation = useArchiveProduct();

  const handleConfirmArchive = () => {
    if (archiveId) {
      archiveMutation.mutate(archiveId, {
        onSuccess: () => setArchiveId(null),
      });
    }
  };

  const columns: ColumnDef<ProductItem>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const primaryImageUrl = getProductPrimaryImage(row.original);

        return (
          <div className="group/product flex min-w-0 items-center gap-3">
            {primaryImageUrl ? (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-slate-50 shadow-sm transition-transform duration-200 group-hover/product:scale-110">
                <Image
                  src={primaryImageUrl}
                  alt={row.original.name}
                  width={PRODUCT_THUMB_PX * 2}
                  height={PRODUCT_THUMB_PX * 2}
                  quality={95}
                  unoptimized
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                <ImageIcon className="h-5 w-5 stroke-[1.5]" />
              </div>
            )}

            <div className="min-w-0">
              <Link
                href={`/products/${row.original.id}`}
                className="block truncate font-semibold text-slate-900 hover:underline"
              >
                {row.original.name}
              </Link>
              <p className="truncate text-[10px] text-slate-500">{row.original.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "basePrice",
      header: "Base Price",
      cell: ({ row }) => <span className="font-semibold text-slate-800">₹{row.original.basePrice}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      cell: ({ row }) => (
        <span className="text-[10px] font-bold text-slate-500 uppercase">{row.original.visibility}</span>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const totalStock = (row.original as any).totalStockAvailable ?? 
          row.original.variants?.reduce((acc: number, v: any) => acc + (v.stockAvailable ?? v.stock ?? 0), 0) ?? 0;
        return (
          <span className={`font-semibold ${totalStock > 0 ? "text-slate-800" : "text-rose-600"}`}>
            {totalStock}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <PermissionGate permission="products:update">
            <Link
              href={`/products/${row.original.id}`}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </PermissionGate>
          <PermissionGate permission="products:delete">
            <button
              onClick={() => setArchiveId(row.original.id)}
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-xs text-slate-500">Manage ecommerce products, pricing, and variants</p>
        </div>
        <PermissionGate permission="products:create">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Product</span>
          </button>
        </PermissionGate>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search products by name or slug..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center space-x-2">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Statuses" },
              { value: "ACTIVE", label: "Published" },
              { value: "DRAFT", label: "Draft" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
            triggerClassName="w-36"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onRowClick={(product) => router.push(`/products/${product.id}`)}
      />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!archiveId}
        title="Archive Product"
        description="Are you sure you want to soft-archive this product? It will be hidden from the storefront."
        isDestructive
        isLoading={archiveMutation.isPending}
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveId(null)}
      />
    </div>
  );
}
