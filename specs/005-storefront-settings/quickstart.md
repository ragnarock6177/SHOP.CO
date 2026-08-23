# Quickstart & Verification Guide: Storefront Settings & Home Page Customization

**Feature**: `005-storefront-settings`  
**Date**: 2026-08-23  

---

## Prerequisites

Ensure all three local services are running:
```bash
# Terminal 1: Backend API (Express on http://localhost:5000)
cd backend && npm run dev

# Terminal 2: Storefront App (Next.js on http://localhost:3000)
cd frontend && npm run dev

# Terminal 3: Admin Panel (Next.js on http://localhost:3001)
cd admin && npm run dev
```

---

## Validation Scenario 1: Retrieve Public Storefront Settings API

**Goal**: Verify that public settings are retrieved cleanly without authentication.

### Command
```bash
curl -X GET http://localhost:5000/api/v1/settings/storefront
```

### Expected Outcome
HTTP `200 OK` with aggregated payload containing `store`, `header`, `home.sections`, `home.banners`, `contact`, `social`, `footer`, and `seo`.

---

## Validation Scenario 2: Admin Panel Settings Navigation & Update

**Goal**: Verify admin settings authorization and state persistence.

1. Open Admin Panel at `http://localhost:3001/settings`.
2. Authenticate as an admin user.
3. Navigate to **General Settings** tab.
4. Update Store Name to `AIRAVÉ ATELIER` and save changes.
5. Verify toast notification confirms save success.
6. Open Storefront at `http://localhost:3000` and confirm the document title / store branding updates.

---

## Validation Scenario 3: Homepage Section Reordering & Toggling

**Goal**: Verify dynamic section ordering and hidden state handling.

1. In Admin Panel (`http://localhost:3001/settings`), click the **Home Page** tab.
2. Toggle off the **New Arrivals** section.
3. Move **Top Selling** to the top position (display order 1).
4. Save settings.
5. Refresh Storefront homepage (`http://localhost:3000`).
6. Confirm **New Arrivals** section is no longer rendered and **Top Selling** is rendered immediately under the Hero banner.

---

## Validation Scenario 4: Hero Banner Campaign Scheduling & Navigation

**Goal**: Verify hero banner creation, image presigned upload, and navigation target.

1. In Admin Panel, navigate to **Banners** tab.
2. Click **Add New Banner**.
3. Upload desktop image, enter title `SPRING '26 CAPSULE`, select target type `CATEGORY`, and choose a target category.
4. Save banner.
5. Refresh Storefront homepage and verify the new banner slide appears in the Hero carousel.
6. Click the CTA button on the banner slide and verify browser navigates directly to the target category page.

---

## Validation Scenario 5: Unauthorized Access Guard

**Goal**: Confirm security controls prevent unauthorized mutation of store settings.

### Command
```bash
curl -X PUT http://localhost:5000/api/v1/admin/settings/general \
  -H "Content-Type: application/json" \
  -d '{"name":"HACKED STORE"}'
```

### Expected Outcome
HTTP `401 Unauthorized` or `403 Forbidden` response:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Administrative authentication required"
  }
}
```
