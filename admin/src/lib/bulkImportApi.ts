import apiClient from "./apiClient";
import { ImportValidationSummary, ImportExecutionResult, ImportMode, FailedImportRow, NormalizedImportRow } from "@/types/bulkImport";
import { ApiResponse } from "@/types/api";

/**
 * Download sample CSV or Excel spreadsheet template
 */
export async function downloadImportTemplate(format: "csv" | "xlsx" = "csv"): Promise<void> {
  const response = await apiClient.get(`/admin/products/import/template?format=${format}`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: format === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `AIRAVE_Product_Import_Template.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Dry-run validation of uploaded spreadsheet or inline-edited rows without database writes
 */
export async function validateProductImport(
  fileOrRows: File | NormalizedImportRow[],
  options: { autoCreateCategories?: boolean; importMode?: ImportMode } = {}
): Promise<ImportValidationSummary> {
  if (Array.isArray(fileOrRows)) {
    const res = await apiClient.post<ApiResponse<ImportValidationSummary>>(
      "/admin/products/import/validate",
      {
        rows: fileOrRows,
        autoCreateCategories: options.autoCreateCategories,
        importMode: options.importMode,
      }
    );
    return res.data.data;
  }

  const formData = new FormData();
  formData.append("file", fileOrRows);
  if (options.autoCreateCategories !== undefined) {
    formData.append("autoCreateCategories", String(options.autoCreateCategories));
  }
  if (options.importMode) {
    formData.append("importMode", options.importMode);
  }

  const res = await apiClient.post<ApiResponse<ImportValidationSummary>>(
    "/admin/products/import/validate",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data.data;
}

/**
 * Execute full batch import / upsert for File or inline-edited rows
 */
export async function executeProductImport(
  fileOrRows: File | NormalizedImportRow[],
  options: {
    autoCreateCategories?: boolean;
    importMode?: ImportMode;
    skipInvalidRows?: boolean;
  } = {}
): Promise<ImportExecutionResult> {
  if (Array.isArray(fileOrRows)) {
    const res = await apiClient.post<ApiResponse<ImportExecutionResult>>(
      "/admin/products/import/execute",
      {
        rows: fileOrRows,
        autoCreateCategories: options.autoCreateCategories,
        importMode: options.importMode,
        skipInvalidRows: options.skipInvalidRows,
      }
    );
    return res.data.data;
  }

  const formData = new FormData();
  formData.append("file", fileOrRows);
  if (options.autoCreateCategories !== undefined) {
    formData.append("autoCreateCategories", String(options.autoCreateCategories));
  }
  if (options.importMode) {
    formData.append("importMode", options.importMode);
  }
  if (options.skipInvalidRows !== undefined) {
    formData.append("skipInvalidRows", String(options.skipInvalidRows));
  }

  const res = await apiClient.post<ApiResponse<ImportExecutionResult>>(
    "/admin/products/import/execute",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data.data;
}

/**
 * Export failed rows as an annotated CSV
 */
export async function exportImportErrors(failedRows: FailedImportRow[]): Promise<void> {
  const response = await apiClient.post(
    "/admin/products/import/errors/export",
    { failedRows },
    { responseType: "blob" }
  );

  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `AIRAVE_Import_Errors_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
