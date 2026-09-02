import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  downloadImportTemplate,
  validateProductImport,
  executeProductImport,
  exportImportErrors,
} from "@/lib/bulkImportApi";
import { ImportMode, FailedImportRow, NormalizedImportRow } from "@/types/bulkImport";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const exportErrorsMutation = useMutation({
    mutationFn: (failedRows: FailedImportRow[]) => exportImportErrors(failedRows),
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
