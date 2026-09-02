import { Request, Response, NextFunction } from "express";
import { generateImportTemplate, generateErrorExportCsv } from "../../services/templateGenerator.service.js";
import { validateSpreadsheetImport, executeSpreadsheetImport } from "../../services/bulkImport.service.js";
import { ImportMode, NormalizedImportRow } from "../../types/bulkImport.js";

export class BulkImportController {
  /**
   * GET /api/v1/admin/products/import/template
   * Downloads official CSV or Excel template.
   */
  static async downloadTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const format = (req.query.format === "xlsx" ? "xlsx" : "csv") as "csv" | "xlsx";
      const { buffer, mimeType, fileName } = generateImportTemplate(format);

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/products/import/validate
   * Dry-run validates uploaded spreadsheet buffer or direct JSON rows without writing to DB.
   */
  static async validateImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let input: Buffer | NormalizedImportRow[] | null = null;

      if (req.file && req.file.buffer) {
        input = req.file.buffer;
      } else if (req.body.rows && Array.isArray(req.body.rows)) {
        input = req.body.rows as NormalizedImportRow[];
      }

      if (!input) {
        res.status(400).json({
          success: false,
          error: { message: "No spreadsheet file or row data provided for validation." },
        });
        return;
      }

      const autoCreateCategories = req.body.autoCreateCategories !== "false" && req.body.autoCreateCategories !== false;
      const importMode = (req.body.importMode === "INSERT_ONLY" ? "INSERT_ONLY" : "UPSERT") as ImportMode;

      const summary = await validateSpreadsheetImport(input, {
        autoCreateCategories,
        importMode,
      });

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err?.message || "Failed to validate spreadsheet data." },
      });
    }
  }

  /**
   * POST /api/v1/admin/products/import/execute
   * Executes the full batch import / upsert.
   */
  static async executeImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let input: Buffer | NormalizedImportRow[] | null = null;

      if (req.file && req.file.buffer) {
        input = req.file.buffer;
      } else if (req.body.rows && Array.isArray(req.body.rows)) {
        input = req.body.rows as NormalizedImportRow[];
      }

      if (!input) {
        res.status(400).json({
          success: false,
          error: { message: "No spreadsheet file or row data provided for execution." },
        });
        return;
      }

      const autoCreateCategories = req.body.autoCreateCategories !== "false" && req.body.autoCreateCategories !== false;
      const importMode = (req.body.importMode === "INSERT_ONLY" ? "INSERT_ONLY" : "UPSERT") as ImportMode;
      const skipInvalidRows = req.body.skipInvalidRows === "true" || req.body.skipInvalidRows === true;
      const adminUserId = (req as any).user?.id || (req as any).adminUser?.id;

      const result = await executeSpreadsheetImport(input, {
        autoCreateCategories,
        importMode,
        skipInvalidRows,
        adminUserId,
      });

      res.status(200).json({
        success: true,
        message: `Import completed: ${result.totalProductsCreated} created, ${result.totalProductsUpdated} updated.`,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err?.message || "Bulk product import failed." },
      });
    }
  }

  /**
   * POST /api/v1/admin/products/import/errors/export
   * Generates a downloadable CSV containing only failed rows.
   */
  static async exportErrors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const failedRows = req.body.failedRows || [];
      const buffer = generateErrorExportCsv(failedRows);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="import_errors_${Date.now()}.csv"`);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
