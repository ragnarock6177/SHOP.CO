import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  downloadImportTemplate,
  validateProductImport,
  executeProductImport,
  exportImportErrors,
} from "@/lib/bulkImportApi";
import { ImportMode, FailedImportRow, NormalizedImportRow } from "@/types/bulkImport";
import { toast } from "@/lib/toast";

export function useBulkProductImport() {
  const queryClient = useQueryClient();

  const validateMutation = useMutation({
    mutationFn: ({
      fileOrRows,
      options,
    }: {
      fileOrRows: File | NormalizedImportRow[];
      options?: { autoCreateCategories?: boolean; importMode?: ImportMode };
    }) => validateProductImport(fileOrRows, options),
  });

  const executeMutation = useMutation({
    mutationFn: ({
      fileOrRows,
      options,
    }: {
      fileOrRows: File | NormalizedImportRow[];
      options?: {
        autoCreateCategories?: boolean;
        importMode?: ImportMode;
        skipInvalidRows?: boolean;
      };
    }) => executeProductImport(fileOrRows, options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success(
        "Import Complete",
        `${result.totalProductsCreated} created, ${result.totalProductsUpdated} updated.`,
      );
    },
  });

  const exportErrorsMutation = useMutation({
    mutationFn: (failedRows: FailedImportRow[]) => exportImportErrors(failedRows),
    onSuccess: () => {
      toast.success("Export Ready", "Error report downloaded successfully.");
    },
  });

  return {
    validateImport: validateMutation.mutateAsync,
    isValidating: validateMutation.isPending,
    validationError: validateMutation.error,
    validationData: validateMutation.data,

    executeImport: executeMutation.mutateAsync,
    isExecuting: executeMutation.isPending,
    executionError: executeMutation.error,
    executionData: executeMutation.data,

    exportErrors: exportErrorsMutation.mutateAsync,
    isExportingErrors: exportErrorsMutation.isPending,

    downloadTemplate: downloadImportTemplate,
  };
}
