# 01 — Overview: GoRoBo Admin & Ops System

## What we are building

A back-office system for running the GoRoBo robotics store:

1. **GoRoBo Inventory** — admin CRUD over the 317-item catalog, with raw cost (`base_price`)
   and per-item margin (flat ₹) editing. Selling `price = base_price + margin`, recomputed
   server-side on every save. Changes are instantly visible on the public site (it fetches
   live items from the API).
2. **GoRoBo Bill Processor** — turn a customer's submitted order into a final invoice:
   - edit line items (quantity, unit price)
   - add items that are not in inventory (custom lines)
   - apply a custom discount (hard cap 10%)
   - apply GST (default 18%, adjustable per order)
   - add shipment cost
   - live quote math, save quote → confirm → complete
   - download the **BOM (bill of materials) as a PDF**
3. **Amaze Wallet** (own sidebar page) — accounting ledger:
   - margins collected → **profit**
   - GST collected → tracked under **GST**
   - raw item cost → paid to the **vendor** when the admin clicks *complete*
   - customer pays the admin; both sides marked in the tracker
   - PDF export of transaction history

## Status flow for an order

```
pending ──(edit quote)──► pending ──(confirm)──► confirmed ──(complete)──► completed
```

- `pending` — order arrived from the site; not yet quoted.
- `confirmed` — quote finalized (line items, discount, GST, shipment, total are frozen).
- `completed` — order marked done; wallet entries are created for it (see 04-quote-math.md).

## Access control

- New permission id: **`gorobo`**.
- Only admins **assigned** the `gorobo` permission see the GoRoBo + Amaze Wallet UI and can
  call the admin gorobo API routes (403 otherwise).
- **Superadmins** (usernames in `ADMIN_VTOP_IDS` env) automatically get `gorobo` in their
  permission list at login and bypass nothing else — same model as `transport`.
- Permission changes apply on the **next login** (permissions ride inside the signed token).

## Decisions locked with the user

| Question | Decision |
|---|---|
| Quote math | GST on discounted total + shipment: `taxable = subtotal − discount; gst = taxable × gst%; total = taxable + gst + shipment` |
| GST rate | Default 18%, adjustable per order in the bill processor |
| Margin entry | GoRoBo already has a built-in margin (`applyMargin` flat-₹ tiers). Admin can set **both** base price (raw cost) and margin (flat ₹); price = base + margin |
| Amaze Wallet placement | Separate sidebar item (own page), gated by the same `gorobo` permission |
| PDF generation | Client-side jsPDF in the Dashboard (already installed, currently unused) |
| Wallet settlement | Any `gorobo` member can mark "customer paid" / "vendor paid" |

## Non-goals (for now)

- No payment gateway integration; settlement is a manual bookkeeping toggle.
- No public-facing invoices; the PDF BOM is admin-side.
- No multi-currency; everything in ₹ (`INR`).
