"use client";

import React, { useState } from "react";
import { ImportValidationSummary, NormalizedImportRow, RowDiagnostic } from "@/types/bulkImport";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Search,
  Layers,
  Box,
  Tag,
  ShieldCheck,
  Trash2,
  Table as TableIcon,
  List,
  Plus,
  HelpCircle,
} from "lucide-react";

interface ImportValidationTableProps {
  summary: ImportValidationSummary;
  rows: NormalizedImportRow[];
  onRowsChange?: (updatedRows: NormalizedImportRow[]) => void;
}

export const ImportValidationTable: React.FC<ImportValidationTableProps> = ({
  summary,
  rows,
  onRowsChange,
}) => {
  const [viewMode, setViewMode] = useState<"GRID" | "DIAGNOSTICS">("GRID");
  const [activeTab, setActiveTab] = useState<"ALL" | "ERRORS" | "WARNINGS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const allDiagnostics: Array<RowDiagnostic & { type: "ERROR" | "WARNING" }> = [
    ...summary.errors.map((e) => ({ ...e, type: "ERROR" as const })),
    ...summary.warnings.map((w) => ({ ...w, type: "WARNING" as const })),
  ];

  // Map of row errors for fast lookup by row index and field
  const rowErrorMap = new Map<string, string>();
  summary.errors.forEach((e) => {
    rowErrorMap.set(`${e.row}:${e.field || "general"}`, e.message);
    rowErrorMap.set(`${e.row}:row_has_error`, e.message);
  });

  const handleCellChange = (rowIndex: number, field: keyof NormalizedImportRow, value: any) => {
    if (!onRowsChange) return;
    const updated = rows.map((r, idx) => {
      const currentRowNum = r.rowIndex || idx + 1;
      if (currentRowNum === rowIndex) {
        return {
          ...r,
          [field]: value,
        };
      }
      return r;
    });
    onRowsChange(updated);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (!onRowsChange) return;
    const updated = rows.filter((r, idx) => (r.rowIndex || idx + 1) !== rowIndex);
    onRowsChange(updated);
  };

  const handleAddRow = () => {
    if (!onRowsChange) return;
    const nextRowIndex = (rows[rows.length - 1]?.rowIndex || rows.length) + 1;
    const newRow: NormalizedImportRow = {
      rowIndex: nextRowIndex,
      handle: `new-product-${nextRowIndex}`,
      productName: "New Product",
      categoryName: "Apparel",
      brand: "AIRAVÉ",
      status: "ACTIVE",
      visibility: "PUBLIC",
      basePrice: 1999,
      sku: `ARV-NEW-${nextRowIndex}`,
      stockQuantity: 10,
      imageUrls: [],
    };
    onRowsChange([...rows, newRow]);
  };

  const filteredRows = rows.filter((r, idx) => {
    const rowNum = r.rowIndex || idx + 1;
    const hasError = rowErrorMap.has(`${rowNum}:row_has_error`);
    if (activeTab === "ERRORS" && !hasError) return false;
    if (activeTab === "WARNINGS" && hasError) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSku = r.sku?.toLowerCase().includes(q);
      const matchName = r.productName?.toLowerCase().includes(q);
      const matchHandle = r.handle?.toLowerCase().includes(q);
      const matchCategory = r.categoryName?.toLowerCase().includes(q);
      const matchRow = rowNum.toString().includes(q);
      return matchSku || matchName || matchHandle || matchCategory || matchRow;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-3.5 flex-1 min-h-0">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 shrink-0">
        <div className="flex flex-col rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Rows</span>
            <Box className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{rows.length}</span>
            <span className="text-[10px] text-slate-500">records</span>
          </div>
        </div>

        <div className="flex flex-col rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Products & Variants</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{summary.totalProducts}</span>
            <span className="text-[10px] text-slate-500">({summary.totalVariants} variants)</span>
          </div>
        </div>

        <div className="flex flex-col rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Validation Status</span>
            <AlertCircle className={`h-4 w-4 ${summary.errors.length > 0 ? "text-rose-500" : "text-emerald-600"}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${summary.errors.length > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {summary.errors.length}
            </span>
            <span className="text-[10px] text-slate-500">
              {summary.errors.length > 0 ? "errors (inline editable)" : "0 errors (all valid)"}
            </span>
          </div>
        </div>

        <div className="flex flex-col rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Catalog Impact</span>
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{summary.newSkusCount}</span>
            <span className="text-[10px] text-slate-500">new / {summary.existingSkusCount} sync</span>
          </div>
        </div>
      </div>

      {/* Category Notification if any */}
      {summary.newCategories.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-700 shrink-0">
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-600 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">New Categories Detected ({summary.newCategories.length}): </span>
            <span className="text-slate-600">
              {summary.newCategories.join(", ")}. These will be automatically registered during import.
            </span>
          </div>
        </div>
      )}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            All Rows ({rows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ERRORS")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "ERRORS"
                ? "bg-rose-900 text-white shadow-xs"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            Errors ({summary.errors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("WARNINGS")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "WARNINGS"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Warnings ({summary.warnings.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, product name..."
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === "GRID"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Grid Edit
            </button>
            <button
              type="button"
              onClick={() => setViewMode("DIAGNOSTICS")}
              className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === "DIAGNOSTICS"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Diagnostics ({allDiagnostics.length})
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MODERN AIRTABLE/SPREADSHEET GRID */}
      {viewMode === "GRID" && (
        <div className="flex flex-col flex-1 min-h-80 h-full rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="flex-1 overflow-auto sidebar-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                <tr>
                  <th className="sticky left-0 z-30 bg-slate-50 py-2.5 px-3 w-14 text-center border-r border-slate-200">
                    Row
                  </th>
                  <th className="sticky left-14 z-30 bg-slate-50 py-2.5 px-3 w-24 text-center border-r border-slate-200">
                    Status
                  </th>
                  <th className="py-2.5 px-3 min-w-55 border-r border-slate-200">Product Name *</th>
                  <th className="py-2.5 px-3 min-w-40 border-r border-slate-200">SKU *</th>
                  <th className="py-2.5 px-3 min-w-40 border-r border-slate-200">Handle (Slug)</th>
                  <th className="py-2.5 px-3 min-w-40 border-r border-slate-200">Category</th>
                  <th className="py-2.5 px-3 min-w-27.5 border-r border-slate-200">Price (₹) *</th>
                  <th className="py-2.5 px-3 min-w-25 border-r border-slate-200">Stock *</th>
                  <th className="py-2.5 px-3 min-w-32.5 border-r border-slate-200">Color</th>
                  <th className="py-2.5 px-3 min-w-22.5 border-r border-slate-200">Size</th>
                  <th className="py-2.5 px-2 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row, idx) => {
                  const rowNum = row.rowIndex || idx + 1;
                  const nameErr = rowErrorMap.get(`${rowNum}:productName`);
                  const skuErr = rowErrorMap.get(`${rowNum}:sku`);
                  const priceErr = rowErrorMap.get(`${rowNum}:basePrice`) || rowErrorMap.get(`${rowNum}:variantPrice`);
                  const stockErr = rowErrorMap.get(`${rowNum}:stockQuantity`);
                  const hasAnyError = rowErrorMap.has(`${rowNum}:row_has_error`);

                  return (
                    <tr
                      key={rowNum}
                      className={`group hover:bg-slate-50/80 transition-colors ${
                        hasAnyError ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* Sticky Row # */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 py-2 px-3 text-center font-medium text-slate-500 border-r border-slate-100">
                        {rowNum}
                      </td>

                      {/* Sticky Status Pill */}
                      <td className="sticky left-14 z-10 bg-white group-hover:bg-slate-50/80 py-2 px-3 text-center border-r border-slate-100">
                        {hasAnyError ? (
                          <span
                            title={rowErrorMap.get(`${rowNum}:row_has_error`)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 cursor-help"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid
                          </span>
                        )}
                      </td>

                      {/* Product Name Input */}
                      <td className={`p-1 border-r border-slate-100 ${nameErr ? "bg-rose-50/50" : ""}`}>
                        <div className="relative">
                          <input
                            type="text"
                            value={row.productName || ""}
                            onChange={(e) => handleCellChange(rowNum, "productName", e.target.value)}
                            placeholder="Product Title"
                            className={`w-full rounded-sm px-2 py-1 text-xs text-slate-900 border transition-all focus:outline-none ${
                              nameErr
                                ? "border-rose-400 bg-white focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
                                : "border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                            }`}
                          />
                          {nameErr && (
                            <span className="block text-[10px] text-rose-600 mt-0.5 px-1 font-medium truncate" title={nameErr}>
                              {nameErr}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SKU Input */}
                      <td className={`p-1 border-r border-slate-100 ${skuErr ? "bg-rose-50/50" : ""}`}>
                        <div className="relative">
                          <input
                            type="text"
                            value={row.sku || ""}
                            onChange={(e) => handleCellChange(rowNum, "sku", e.target.value)}
                            placeholder="SKU Code"
                            className={`w-full rounded-sm px-2 py-1 text-xs text-slate-900 border transition-all focus:outline-none ${
                              skuErr
                                ? "border-rose-400 bg-white focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
                                : "border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                            }`}
                          />
                          {skuErr && (
                            <span className="block text-[10px] text-rose-600 mt-0.5 px-1 font-medium truncate" title={skuErr}>
                              {skuErr}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Handle Input */}
                      <td className="p-1 border-r border-slate-100">
                        <input
                          type="text"
                          value={row.handle || ""}
                          onChange={(e) => handleCellChange(rowNum, "handle", e.target.value)}
                          placeholder="product-handle"
                          className="w-full rounded-sm px-2 py-1 text-xs text-slate-800 border border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        />
                      </td>

                      {/* Category Input */}
                      <td className="p-1 border-r border-slate-100">
                        <input
                          type="text"
                          value={row.categoryName || ""}
                          onChange={(e) => handleCellChange(rowNum, "categoryName", e.target.value)}
                          placeholder="Apparel > Tops"
                          className="w-full rounded-sm px-2 py-1 text-xs text-slate-800 border border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        />
                      </td>

                      {/* Price Input */}
                      <td className={`p-1 border-r border-slate-100 ${priceErr ? "bg-rose-50/50" : ""}`}>
                        <input
                          type="number"
                          min="0"
                          value={row.basePrice}
                          onChange={(e) => handleCellChange(rowNum, "basePrice", parseFloat(e.target.value) || 0)}
                          className={`w-full rounded-sm px-2 py-1 text-xs text-slate-900 border transition-all focus:outline-none ${
                            priceErr
                              ? "border-rose-400 bg-white focus:border-rose-600"
                              : "border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          }`}
                        />
                      </td>

                      {/* Stock Input */}
                      <td className={`p-1 border-r border-slate-100 ${stockErr ? "bg-rose-50/50" : ""}`}>
                        <input
                          type="number"
                          min="0"
                          value={row.stockQuantity}
                          onChange={(e) => handleCellChange(rowNum, "stockQuantity", parseInt(e.target.value, 10) || 0)}
                          className={`w-full rounded-sm px-2 py-1 text-xs text-slate-900 border transition-all focus:outline-none ${
                            stockErr
                              ? "border-rose-400 bg-white focus:border-rose-600"
                              : "border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          }`}
                        />
                      </td>

                      {/* Color */}
                      <td className="p-1 border-r border-slate-100">
                        <input
                          type="text"
                          value={row.colorName || ""}
                          onChange={(e) => handleCellChange(rowNum, "colorName", e.target.value)}
                          placeholder="e.g. Obsidian Black"
                          className="w-full rounded-sm px-2 py-1 text-xs text-slate-800 border border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        />
                      </td>

                      {/* Size */}
                      <td className="p-1 border-r border-slate-100">
                        <input
                          type="text"
                          value={row.size || ""}
                          onChange={(e) => handleCellChange(rowNum, "size", e.target.value)}
                          placeholder="S, M, L"
                          className="w-full rounded-sm px-2 py-1 text-xs text-slate-800 border border-slate-200/80 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rowNum)}
                          title="Remove this row"
                          className="text-slate-400 hover:text-rose-600 transition p-1 rounded-sm hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grid Footer Bar */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 shrink-0 text-xs text-slate-600">
            <span className="text-[11px] text-slate-500">
              Tip: Edit any cell inline to correct errors in real time before execution.
            </span>
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 transition"
            >
              <Plus className="h-3.5 w-3.5 text-slate-600" />
              Add Product Row
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED DIAGNOSTIC LOGS */}
      {viewMode === "DIAGNOSTICS" && (
        <div className="flex-1 min-h-80 h-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-2xs sidebar-scrollbar">
          {allDiagnostics.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-slate-900">All rows passed dry-run validation!</p>
              <p className="text-xs text-slate-500 mt-0.5">Switch back to Grid Edit view to inspect or adjust any details.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2.5 pl-3 pr-2 w-16">Row</th>
                  <th className="py-2.5 px-2 w-20">Type</th>
                  <th className="py-2.5 px-2 w-36">Identifier / SKU</th>
                  <th className="py-2.5 px-2 w-32">Field</th>
                  <th className="py-2.5 pl-2 pr-3">Diagnostic Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allDiagnostics.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 pl-3 pr-2 font-medium text-slate-700">Row {item.row}</td>
                    <td className="py-2 px-2">
                      {item.type === "ERROR" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                          <AlertTriangle className="h-3 w-3" />
                          Warning
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-slate-900 font-medium truncate max-w-40">
                      {item.sku || item.handle || "—"}
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-medium">{item.field || "—"}</td>
                    <td className="py-2 pl-2 pr-3 text-slate-700">{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
