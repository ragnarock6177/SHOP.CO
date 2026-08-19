"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Layers } from "lucide-react";
import apiClient from "../../../lib/apiClient";
import { ApiResponse, ApiPaginatedResponse } from "../../../types/api";
import { DataTable } from "../../../components/data-table/DataTable";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<CategoryItem>>("/categories");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; slug: string }) => {
      const response = await apiClient.post<ApiResponse<CategoryItem>>("/categories", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setIsModalOpen(false);
      setName("");
      setSlug("");
    },
  });

  const columns: ColumnDef<CategoryItem>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-zinc-400" />
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
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${row.original.isActive ? "bg-emerald-950 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>
          {row.original.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Category Directory</h1>
          <p className="text-xs text-zinc-400">Organize product hierarchy and storefront taxonomy</p>
        </div>
        <PermissionGate permission="categories:create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </PermissionGate>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100">Create New Category</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  placeholder="e.g. Outerwear"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="outerwear"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate({ name, slug })}
                disabled={createMutation.isPending || !name}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
