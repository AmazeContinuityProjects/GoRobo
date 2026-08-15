# 04 — Quote Math & Accounting

## Quote formula (locked with user)

```
subtotal       = Σ (line.unitPrice × line.quantity)
discount_amount = round(subtotal × discountPct / 100)        // discountPct ∈ [0, 10]
taxable        = subtotal − discount_amount
gst_amount     = round(taxable × gstPct / 100)               // gstPct defaults to 18
total          = taxable + gst_amount + shipment_cost
```

All money in ₹, rounded to 2 decimals at each step. The **customer pays `total`**.

## Wallet entries created on order completion

```
baseCost  = Σ (line.basePrice × line.quantity)   // 0 for custom lines
profit    = taxable − baseCost + shipment_cost   // margin after discount + shipment income
gst       = gst_amount
```

| party | kind | amount | status | who pays whom |
|---|---|---|---|---|
| customer | profit | `taxable − baseCost + shipment_cost` | pending | customer pays owner (margin income) |
| customer | gst | `gst_amount` | pending | customer pays owner (held for GST) |
| vendor | cost | `baseCost` | pending | owner pays vendor (raw cost) |

"Mark customer paid" settles the two customer entries; "Mark vendor paid" settles the
vendor entry. Both are manual bookkeeping toggles (no payment gateway).

## Money flow diagram

```
                customer
              ┌──────────┐
              │ pays total│
              └────┬─────┘
                   │  total
        ┌──────────┴───────────┐
        │        AMAZE         │
        │  profit = taxable    │  ← owner keeps (margin after discount)
        │  − baseCost + shipment│
        │  gst = gst_amount    │  ← held for GST filing
        └──────────┬───────────┘
                   │  baseCost
              ┌────┴─────┐
              │  VENDOR  │  ← raw item cost paid on "complete"
              └──────────┘
```

## Sanity invariants (tested during implementation)

- `total − baseCost = profit + gst` for every completed order (money conservation).
- Completing an order twice must not double-create entries (guard on `status` + 409).
- Settling a party twice is idempotent (`settled_at` not overwritten).
- Deleting an order cascades its wallet entries (FK `ON DELETE CASCADE`).
