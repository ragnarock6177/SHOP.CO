# Quickstart & Verification Guide: Bulk Product & Variant Import

**Feature**: `006-bulk-product-import`  
**Date**: 2026-09-02

## 1. Prerequisites
- Backend service running on `http://localhost:5000`
- Admin Next.js app running on `http://localhost:3001`
- Admin account logged in with `products:create` and `products:manage` permissions

---

## 2. Validation Scenarios

### Scenario A: Download Standard Template
1. Navigate to `http://localhost:3001/products`.
2. Click the **"Import Products"** button in the top action bar.
3. In the Import Dialog, click **"Download Sample Template (CSV)"**.
4. Verify the downloaded file opens in Excel/Sheets with clear headers (`Handle`, `Title`, `Category`, `Base Price`, `SKU`, `Color`, `Size`, `Stock Quantity`, etc.) and pre-populated sample rows.

### Scenario B: Dry-Run Error Detection
1. Create a test CSV containing:
   - 1 valid product row
   - 1 row missing required `Base Price`
   - 1 row with duplicate SKU within the file
2. Upload the file to the Import Dialog.
3. Observe that the UI displays a **Diagnostic Summary**:
   - Total Rows: 3
   - Valid: 1, Errors: 2
   - Pinpoints exact row numbers and error descriptions.
   - The "Execute Import" button remains disabled or requests "Skip Invalid Rows".

### Scenario C: Multi-Variant End-to-End Import
1. Upload a valid CSV containing a parent handle with 4 variants (e.g. Black-S, Black-M, OffWhite-S, OffWhite-M).
2. Choose **"Upsert (Create or Update)"** mode and click **"Confirm & Execute Import"**.
3. Verify progress bar completes with 100% success.
4. Refresh the product list and click the new product:
   - Verify parent product name, category, and description are created.
   - Verify all 4 variants exist with accurate individual SKUs, prices, color/size tags, and initial inventory stock balances.
