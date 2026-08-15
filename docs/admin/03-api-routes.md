# 03 — API Routes

Base: `https://amazecc-api.vercel.app` (dev: `http://localhost:3301`). All responses are
`{ success, ... }` / `{ success: false, error }`. Admin routes are `export const dynamic =
"force-dynamic"` and carry an `@openapi` JSDoc block for the auto-generated swagger.

## Auth conventions

```ts
const auth = await requireAdminAuth();
if (!auth.permissions.includes("gorobo")) {
  return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
}
```

Permission plumbing (must add `"gorobo"` everywhere):

- `src/lib/auth.ts` — default permission list in `signAdminToken`.
- `src/app/api/admin/auth/route.ts` — superadmin default permissions (env-var admins).
- `src/app/api/admin/users/route.ts` + `src/app/api/admin/users/[username]/route.ts` —
  `ALLOWED_PERMISSIONS` validation array.

## Existing public routes (unchanged behavior)

| Route | Notes |
|---|---|
| `GET /api/gorobo/items?category=` | catalog for the storefront; prices now come from base+margin (same values) |
| `POST /api/gorobo/orders` | now also snapshots `unitPrice/basePrice/margin` per line |
| `POST /api/gorobo/seed` | upserts items; seed JSON now carries `base_price`/`margin` |

## New admin routes

All under `/api/admin/gorobo/...`, all `requireAdminAuth` + `permissions.includes("gorobo")`.

### Items

| Route | Body | Returns |
|---|---|---|
| `GET /api/admin/gorobo/items` | `?search=&category=` | `{ success, count, items }` (id, name, description, price, basePrice, margin, category, inStock, image, updatedAt) |
| `POST /api/admin/gorobo/items` | `{ name, description, category, basePrice, margin, inStock, image }` | 201 `{ success, item }`; id auto-slugified; `price = basePrice + margin` |
| `PUT /api/admin/gorobo/items/[id]` | same fields (partial OK) | `{ success, item }`; recomputes price; 404 if missing |

Validation: name required ≤100 chars, category required ≤60, basePrice/margin ≥ 0,
numbers rounded to 2 decimals.

### Orders

| Route | Body | Returns |
|---|---|---|
| `GET /api/admin/gorobo/orders` | `?status=&search=` (name/phone) | `{ success, count, orders }` with expanded quotes: status, subtotal, discount, gst, shipment, total, line items, created |
| `GET /api/admin/gorobo/orders/[id]` | — | `{ success, order }` full detail incl. wallet entries |
| `PUT /api/admin/gorobo/orders/[id]` | `{ items, discountPct, gstPct, shipmentCost, notes }` | recomputed quote; 409 if already completed |
| `POST /api/admin/gorobo/orders/[id]/confirm` | — | sets `status = confirmed`; 409 unless pending |
| `POST /api/admin/gorobo/orders/[id]/complete` | — | sets `status = completed` + creates wallet entries; 409 unless confirmed |

Quote PUT validation:
- items 1–100; inventory lines must exist & be in stock at write time (qty 1–99);
  custom lines need `name` (≤100) and `unitPrice ≥ 0`.
- `discountPct` ∈ [0, 10] (hard cap), `gstPct` ∈ [0, 100], `shipmentCost ≥ 0`.
- Server recomputes and persists: `subtotal`, `discount_amount = round(subtotal × discountPct/100)`,
  `taxable = subtotal − discount_amount`, `gst_amount = round(taxable × gstPct/100)`,
  `total = taxable + gst_amount + shipment_cost`.

### Wallet

| Route | Body | Returns |
|---|---|---|
| `GET /api/admin/gorobo/wallet` | — | summary + transactions |
| `POST /api/admin/gorobo/wallet/orders/[id]/settle` | `{ party: 'customer' \| 'vendor' }` | marks all entries for that order+party settled (idempotent) |

Wallet summary shape:

```json
{
  "success": true,
  "summary": {
    "profitTotal": 0, "profitSettled": 0,
    "gstTotal": 0, "gstSettled": 0,
    "vendorPayable": 0, "vendorPaid": 0,        // customer = profit + gst (+ shipment inside profit)
    "customerReceivable": 0, "customerReceived": 0
  },
  "transactions": [ { "orderId", "userName", "phoneNumber", "createdAt",
                      "customer": { "profit": { "amount", "status" }, "gst": { "amount", "status" } },
                      "vendor": { "cost": { "amount", "status" } } } ]
}
```
