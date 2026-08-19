"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Sliders } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { DataTable } from "@/components/data-table/DataTable";

export interface AttributeItem {
  id: string;
  name: string;
  slug: string;
  isVariantAttribute: boolean;
  isFilterable: boolean;
  values?: Array<{ id: string; value: string; displayValue: string | null; colorHex: string | null }>;
}

export default function AttributesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<AttributeItem>>("/admin/attributes");
      return response.data;
    },
  });

  const columns: ColumnDef<AttributeItem>[] = [
    {
      accessorKey: "name",
      header: "Attribute Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Sliders className="h-4 w-4 text-zinc-400" />
          <span className="font-semibold text-zinc-100">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => <code className="text-[11px] text-zinc-400">{row.original.slug}</code>,
    },
    {
      accessorKey: "isVariantAttribute",
      header: "Variant Attribute",
      cell: ({ row }) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${row.original.isVariantAttribute ? "bg-emerald-950 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>
          {row.original.isVariantAttribute ? "YES" : "NO"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Product Attributes & Swatches</h1>
        <p className="text-xs text-zinc-400">Configure size, color, material, and variant swatches</p>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />
    </div>
  );
}
