# 02 — Data Model

All gorobo DDL lives in `AmazeCC-API/src/lib/gorobo/schema.ts` (`ensureGoroboSchema()`),
idempotent: `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

## gorobo_items (existing + new columns)

```sql
CREATE TABLE IF NOT EXISTS gorobo_items (
  id          TEXT PRIMARY KEY,            -- slug id, e.g. 'nodemcu-v3'
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL,      -- selling price (base + margin), kept in sync
  category    TEXT NOT NULL,
  in_stock    BOOLEAN NOT NULL DEFAULT true,
  image       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NEW:
ALTER TABLE gorobo_items ADD COLUMN IF NOT EXISTS base_price NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE gorobo_items ADD COLUMN IF NOT EXISTS margin     NUMERIC(10,2) NOT NULL DEFAULT 0;
```

- `base_price` — raw cost to Amaze (what the vendor is paid per unit).
- `margin` — flat ₹ profit (GoRoBo's built-in `applyMargin` tier margins become the seed default).
- `price` — **always** `base_price + margin`, recomputed by the API on write. Admin UI shows a
  live price preview while editing.

### Backfill of existing rows

Existing rows only have `price`. Because the margin tiers are deterministic
(≥3000→150, ≥999→70, ≥400→50, ≥230→35, ≥150→20, ≥70→15, ≥30→7, ≥10→3, else 1),
we reverse-map: `margin = tier(price)`, `base_price = price − margin`. Done by regenerating
`src/data/gorobo/items.json` with `base_price`/`margin` and re-running the seed (upsert),
which overwrites every row.

## gorobo_orders (existing + new columns)

```sql
CREATE TABLE IF NOT EXISTS gorobo_orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name    TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  items        JSONB NOT NULL,             -- [{ itemId, quantity, unitPrice, basePrice, margin } | { custom, name, quantity, unitPrice }]
  total        NUMERIC(10,2) NOT NULL,     -- total at time of placement (catalog prices, no gst/shipment)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NEW:
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'pending';  -- pending|confirmed|completed
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS subtotal       NUMERIC(10,2) NOT NULL DEFAULT 0; -- sum(line unitPrice * qty)
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS discount_pct   NUMERIC(5,2)  NOT NULL DEFAULT 0; -- 0..10 hard cap
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS gst_pct        NUMERIC(5,2)  NOT NULL DEFAULT 18;
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS gst_amount     NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS shipment_cost  NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE gorobo_orders ADD COLUMN IF NOT EXISTS notes          TEXT NOT NULL DEFAULT '';
```

- The public `POST /api/gorobo/orders` now also **snapshots** `unitPrice`, `basePrice`,
  `margin` per line (from the catalog at placement time) so the bill processor works even if
  the catalog changes later. `total` keeps its current meaning (catalog sum).
- The bill processor rewrites `items` (quantities, unit prices, custom lines) plus the quote
  columns; the server recomputes `subtotal`, `discount_amount`, `gst_amount`, `total`.

### Line item shapes (JSONB)

Inventory line:

```json
{ "itemId": "nodemcu-v3", "quantity": 2, "unitPrice": 549, "basePrice": 399, "margin": 150 }
```

Custom line (not in inventory):

```json
{ "custom": true, "name": "Vero board 10x8", "quantity": 5, "unitPrice": 45 }
```

`custom` lines carry `margin 0` and `basePrice 0` (no vendor cost known); their full amount
counts as profit (configurable later).

## gorobo_wallet_entries (new table)

```sql
CREATE TABLE IF NOT EXISTS gorobo_wallet_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES gorobo_orders(id) ON DELETE CASCADE,
  party      TEXT NOT NULL CHECK (party IN ('customer','vendor')),  -- who pays
  kind       TEXT NOT NULL CHECK (kind IN ('profit','gst','cost')), -- accounting bucket
  amount     NUMERIC(10,2) NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','settled')),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Created **once** when an order is completed (see 04-quote-math.md for amounts):

| order | party | kind | amount | meaning |
|---|---|---|---|---|
| any completed | customer | profit | subtotal − discount − baseCost + shipment | margin after discount + shipment income |
| any completed | customer | gst | gst_amount | GST collected from customer (owed to GST) |
| any completed | vendor | cost | Σ basePrice × qty | raw cost Amaze must pay the vendor |

Settlement: `POST /api/admin/gorobo/wallet/orders/[id]/settle {party}` flips every entry of
that `order_id` + `party` to `settled` (sets `settled_at = now()`, idempotent).
