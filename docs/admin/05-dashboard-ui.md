# 05 — AmazeCC-Dashboard UI

Admin portal is a static-export client app. Token (with permissions) in
`localStorage` (`admin_token`, `admin_role`, `admin_permissions`); API calls via
`src/lib/api.ts` `apiFetch()`.

## Sidebar (AdminLayout.tsx)

Two new nav groups/items, both gated by `requiredPermission: 'gorobo'`:

```
GoRoBo         (id: 'gorobo')      → internal tabs: Inventory | Bill Processor
Amaze Wallet   (id: 'gorobo-wallet') → single-page wallet view
```

Both wired in `Main.tsx` (`{activeTab === ... && <Component/>}`) and the hardcoded
superadmin page `admin/page.tsx`.

## Permissions

`AdminUsersTab.tsx` `AVAILABLE_PERMISSIONS` += `{ id: 'gorobo', label: 'GoRoBo' }`.
Superadmins get `gorobo` automatically at login (API side). A non-superadmin admin is
granted it via the existing Users tab chip UI; effective after re-login.

## Components (`src/components/custom/admin/gorobo/`)

### GoRoboInventory.tsx
- Search input + category select (from items) + "Add item" button (amazeui `Modal`).
- Table: image thumb, name, category, base price, margin, computed price, stock badge,
  edit button → modal form.
- Form fields: name, description, category, base price (₹), margin (₹) with **live price
  preview** (`base + margin`), in-stock switch, image path (URL or `images/products/<id>.png`).
- Save → `POST /api/admin/gorobo/items` or `PUT .../[id]`; success banner; table refresh.
- Follows TransportManager conventions (custom HTML table, `msg` banner, `confirm()` for
  destructive ops, `StatusBadge`-style pills).

### GoRoboBillProcessor.tsx
- Internal tab strip pattern (like TransportManager TABS) is NOT needed here — this is one
  of the two tabs inside the GoRoBo view.
- **Orders list**: table (created date, customer, phone, #lines, status badge
  pending/confirmed/completed, total, View). Filter by status, search by name/phone.
- **Order detail** (Modal, wide): editable line-item table —
  - inventory lines: name (read-only), qty (input), unit price (input) → line total;
  - custom lines: name (input), qty, unit price, remove button; "Add custom line" button;
  - remove line for any line.
  - Footer inputs: Discount % (0–10, client+server validated), GST % (default 18),
    Shipment ₹, Notes.
  - Live summary block: subtotal → discount → taxable → GST amount → shipment → **total**.
- Buttons (visibility by status):
  - pending: **Save quote** (PUT) · **Confirm quote** (PUT then confirm or separate confirm POST) · Download BOM PDF
  - confirmed: **Complete order** (POST complete → wallet) · Download BOM PDF
  - completed: Download BOM PDF only (read-only).

### AmazeWallet.tsx (own sidebar page)
- Summary cards: Profit (settled/pending), GST collected (settled/pending),
  Vendor payable/paid, Customer receivable/received.
- Transactions table (per completed order): date, customer, phone, profit, GST, vendor
  cost, per-party status chips, actions:
  - "Mark customer paid" → settle customer entries
  - "Mark vendor paid" → settle vendor entries
  - both disabled after settled, idempotent on API anyway.
- **Download PDF** button → wallet history export (jsPDF).

## Shared helpers

- `src/components/custom/admin/gorobo/gorobo-api.ts` — typed fetch wrappers over
  `apiFetch()` for all admin gorobo endpoints + `formatINR()`.
- `src/components/custom/admin/gorobo/gorobo-pdf.ts` — jsPDF helpers (see 06).
