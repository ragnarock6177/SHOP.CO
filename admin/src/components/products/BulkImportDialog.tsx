"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBulkProductImport } from "@/hooks/queries/useBulkProductImport";
import { ImportValidationSummary, ImportExecutionResult, ImportMode, NormalizedImportRow } from "@/types/bulkImport";
import { ImportValidationTable } from "./ImportValidationTable";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = "UPLOAD" | "VALIDATING" | "REVIEW" | "EXECUTING" | "COMPLETE";

export const BulkImportDialog: React.FC<BulkImportDialogProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<ImportStep>("UPLOAD");
  const [importMode, setImportMode] = useState<ImportMode>("UPSERT");
  const [autoCreateCategories, setAutoCreateCategories] = useState(true);
  const [skipInvalidRows, setSkipInvalidRows] = useState(false);

  const [currentRows, setCurrentRows] = useState<NormalizedImportRow[]>([]);
  const [validationSummary, setValidationSummary] = useState<ImportValidationSummary | null>(null);
  const [executionResult, setExecutionResult] = useState<ImportExecutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    validateImport,
    executeImport,
    downloadTemplate,
    exportErrors,
    isExportingErrors,
  } = useBulkProductImport();

  const handleReset = () => {
    setSelectedFile(null);
    setCurrentRows([]);
    setStep("UPLOAD");
    setValidationSummary(null);
    setExecutionResult(null);
    setErrorMessage(null);
  };

  const handleDialogClose = () => {
    if (step === "EXECUTING") return;
    handleReset();
    onClose();
  };

  const handleFileSelection = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setErrorMessage("Please select a valid CSV or Excel (.xlsx) spreadsheet.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File exceeds 15MB limit. Please upload a smaller file.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setStep("VALIDATING");

    try {
      const summary = await validateImport({
        fileOrRows: file,
        options: { autoCreateCategories, importMode },
      });
      setValidationSummary(summary);
      setCurrentRows(summary.normalizedRows || []);
      setStep("REVIEW");
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error?.message || err?.message || "Failed to validate spreadsheet.");
      setStep("UPLOAD");
    }
  };

  const handleRowsChange = useCallback(async (updatedRows: NormalizedImportRow[]) => {
    setCurrentRows(updatedRows);
    try {
      const summary = await validateImport({
        fileOrRows: updatedRows,
        options: { autoCreateCategories, importMode },
      });
      setValidationSummary(summary);
    } catch (err: any) {
      // Keep edit state responsive
    }
  }, [autoCreateCategories, importMode, validateImport]);

  const handleExecute = async () => {
    if (currentRows.length === 0 && !selectedFile) return;

    setStep("EXECUTING");
    setErrorMessage(null);

    try {
      const result = await executeImport({
        fileOrRows: currentRows.length > 0 ? currentRows : selectedFile!,
        options: {
          autoCreateCategories,
          importMode,
          skipInvalidRows,
        },
      });

      setExecutionResult(result);
      setStep("COMPLETE");
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error?.message || err?.message || "Import execution encountered an error.");
      setStep("REVIEW");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[96vw] w-[96vw] 2xl:max-w-7xl max-h-[92dvh] h-[92dvh] flex flex-col p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 pr-14 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Bulk Product & Variant Import
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Upload, dry-run validate, and inline-edit multi-variant catalogs before database ingestion
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className={`px-2.5 py-1 rounded-full ${step === "UPLOAD" || step === "VALIDATING" ? "bg-slate-900 text-white" : "bg-slate-200/80 text-slate-700"}`}>
              1. Upload
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className={`px-2.5 py-1 rounded-full ${step === "REVIEW" || step === "EXECUTING" ? "bg-slate-900 text-white" : "bg-slate-200/80 text-slate-700"}`}>
              2. Validate & Edit
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className={`px-2.5 py-1 rounded-full ${step === "COMPLETE" ? "bg-slate-900 text-white" : "bg-slate-200/80 text-slate-700"}`}>
              3. Done
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className={`flex-1 min-h-0 p-5 sm:p-6 flex flex-col gap-4 ${step === "REVIEW" ? "overflow-hidden" : "overflow-y-auto"}`}>
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 shrink-0">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Step 1: Upload & Configuration */}
          {step === "UPLOAD" && (
            <div className="flex flex-col gap-5">
              {/* Template Download Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Official Product Import Template</h4>
                    <p className="text-[11px] text-slate-500">
                      Standard columns for single products, multi-colorways, sizes, prices, and imagery.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTemplate("csv")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    CSV Template
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTemplate("xlsx")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleFileSelection(e.dataTransfer.files[0]);
                  }
                }}
                className="group flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center cursor-pointer transition hover:border-slate-500 hover:bg-slate-100/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Click to browse or drag & drop your catalog spreadsheet here
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports .CSV, .XLSX, and .XLS up to 15MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelection(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Ingestion Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-slate-200 bg-white p-4">
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    Import Mode & Conflict Strategy
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "UPSERT"}
                        onChange={() => setImportMode("UPSERT")}
                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <span className="font-semibold text-slate-900">Upsert (Update & Insert)</span>
                        <p className="text-[11px] text-slate-500">
                          Updates existing products/variants matching SKU or slug and inserts new ones.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "INSERT_ONLY"}
                        onChange={() => setImportMode("INSERT_ONLY")}
                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <span className="font-semibold text-slate-900">Insert New Only</span>
                        <p className="text-[11px] text-slate-500">
                          Skips any rows matching existing SKUs in the catalog.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    Taxonomy Automation
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCreateCategories}
                      onChange={(e) => setAutoCreateCategories(e.target.checked)}
                      className="mt-0.5 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">Auto-create Missing Categories</span>
                      <p className="text-[11px] text-slate-500">
                        Automatically creates new categories if specified in the spreadsheet.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 1.5: Validating Loader */}
          {step === "VALIDATING" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-9 w-9 animate-spin text-slate-900 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Running Pre-Import Dry-Run Diagnostics…</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Parsing spreadsheet rows, verifying SKU constraints, checking pricing ranges, and validating taxonomy.
              </p>
            </div>
          )}

          {/* Step 2: Dry-Run Review & Interactive Spreadsheet Grid */}
          {step === "REVIEW" && validationSummary && (
            <div className="flex flex-col flex-1 min-h-0 gap-3">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pre-Import Dry-Run Report & Spreadsheet Editor
                  </h4>
                  <p className="text-xs text-slate-900 font-semibold mt-0.5">
                    {selectedFile ? `File: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)` : "Custom Dataset"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  Upload New File
                </button>
              </div>

              {/* Interactive Validation Table & Spreadsheet Grid */}
              <ImportValidationTable
                summary={validationSummary}
                rows={currentRows}
                onRowsChange={handleRowsChange}
              />

              {/* Validation Warning & Skip Control */}
              {validationSummary.errors.length > 0 && (
                <div className="rounded-md border border-rose-200 bg-rose-50/70 p-3 flex items-start gap-2.5 text-xs shrink-0">
                  <ShieldAlert className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-900">Errors Detected: </span>
                    <span className="text-rose-800">
                      {validationSummary.errors.length} rows contain invalid data. You can edit the cells directly in the table above, or check &quot;Skip Invalid Rows&quot; below.
                    </span>
                    <label className="flex items-center gap-2 mt-2 font-bold text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipInvalidRows}
                        onChange={(e) => setSkipInvalidRows(e.target.checked)}
                        className="rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      Skip {validationSummary.errors.length} invalid rows and import {Math.max(0, currentRows.length - validationSummary.errors.length)} valid rows
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Executing Loader */}
          {step === "EXECUTING" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-9 w-9 animate-spin text-slate-900 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Ingesting Products & Creating Variants…</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Writing parent products, linking color/size attributes, setting up inventory balances, and logging audit movements.
              </p>
            </div>
          )}

          {/* Step 4: Completion Summary */}
          {step === "COMPLETE" && executionResult && (
            <div className="flex flex-col gap-5 py-4">
              <div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50/70 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Bulk Import Completed Successfully</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your product catalog and inventory balances have been updated.
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-white p-3 shadow-2xs text-center">
                  <span className="text-[10px] font-semibold uppercase text-slate-500">Products Created</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{executionResult.totalProductsCreated}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 shadow-2xs text-center">
                  <span className="text-[10px] font-semibold uppercase text-slate-500">Products Updated</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{executionResult.totalProductsUpdated}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 shadow-2xs text-center">
                  <span className="text-[10px] font-semibold uppercase text-slate-500">Variants Synced</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {executionResult.totalVariantsCreated + executionResult.totalVariantsUpdated}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 shadow-2xs text-center">
                  <span className="text-[10px] font-semibold uppercase text-slate-500">Stock Units Added</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{executionResult.totalStockUnitsAdded}</p>
                </div>
              </div>

              {/* Failed rows export */}
              {executionResult.failedRows.length > 0 && (
                <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 p-3">
                  <div className="text-xs text-rose-800 font-medium">
                    {executionResult.failedRows.length} rows encountered issues. Download error log to inspect.
                  </div>
                  <button
                    type="button"
                    onClick={() => exportErrors(executionResult.failedRows)}
                    disabled={isExportingErrors}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-900 shadow-2xs hover:bg-rose-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Error Rows (.CSV)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 shrink-0">
          {step === "UPLOAD" && (
            <>
              <button
                type="button"
                onClick={handleDialogClose}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
              >
                Select Spreadsheet File
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {step === "REVIEW" && (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back / Choose File
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={validationSummary ? !validationSummary.isValid && !skipInvalidRows : true}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 disabled:pointer-events-none"
              >
                Confirm & Execute Import
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {step === "COMPLETE" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleDialogClose}
                className="rounded-md bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
              >
                Done / View Products
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
