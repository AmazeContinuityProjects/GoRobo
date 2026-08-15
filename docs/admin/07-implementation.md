# 07 — Implementation Checklist

Order of work. Each step ends buildable.

## Phase 1 — AmazeCC-API data layer
- [ ] `src/lib/gorobo/schema.ts`: add `base_price`/`margin` ALTERs to `gorobo_items`,
      quote columns + `status` ALTERs to `gorobo_orders`, `gorobo_wallet_entries` table.
- [ ] Backfill existing items: reverse `applyMargin` tiers → `base_price`/`margin`.
      Regenerate `src/data/gorobo/items.json` with the two new fields and re-run the seed.
- [ ] `POST /api/gorobo/orders`: snapshot `unitPrice/basePrice/margin` per line.

## Phase 2 — AmazeCC-API permissions
- [ ] `src/lib/auth.ts` default permissions += `'gorobo'`.
- [ ] `src/app/api/admin/auth/route.ts` superadmin list += `'gorobo'`.
- [ ] `admin/users` + `admin/users/[username]` ALLOWED_PERMISSIONS += `'gorobo'`.

## Phase 3 — AmazeCC-API admin routes (`src/app/api/admin/gorobo/`)
- [ ] `items/route.ts` — GET (search/category) + POST.
- [ ] `items/[id]/route.ts` — PUT.
- [ ] `orders/route.ts` — GET list.
- [ ] `orders/[id]/route.ts` — GET detail + PUT quote.
- [ ] `orders/[id]/confirm/route.ts` — POST.
- [ ] `orders/[id]/complete/route.ts` — POST (+ wallet entry creation, guarded).
- [ ] `wallet/route.ts` — GET summary.
- [ ] `wallet/orders/[id]/settle/route.ts` — POST { party }.
- [ ] `pnpm build` API green; runtime smoke tests (signed token): CRUD → quote → confirm →
      complete → wallet → settle; money-conservation invariant check.

## Phase 4 — AmazeCC-Dashboard
- [ ] `AdminUsersTab.tsx` AVAILABLE_PERMISSIONS += gorobo.
- [ ] `AdminLayout.tsx` nav: GoRoBo + Amaze Wallet (requiredPermission 'gorobo').
- [ ] `Main.tsx` + `admin/page.tsx` wiring.
- [ ] `gorobo/gorobo-api.ts` + `gorobo-pdf.ts` helpers.
- [ ] `GoRoboInventory.tsx`.
- [ ] `GoRoboBillProcessor.tsx` + BOM PDF.
- [ ] `AmazeWallet.tsx` + history PDF.
- [ ] `pnpm build` Dashboard green.

## Phase 5 — Verification
- [ ] Both repos build clean (`pnpm build`).
- [ ] API runtime test against dev server (3301) — full happy path + error paths
      (403 no permission, 409 wrong status, discount > 10 rejected).
- [ ] Static GoRobo site still builds; catalog prices unchanged.
- [ ] Docs updated to match final implementation.

## Environment reminders (gotchas from earlier sessions)
- Windows + PowerShell; Node v26; pnpm.
- `pnpm-workspace.yaml` `allowBuilds` must keep `canvas: true` etc.
- Delete stale `.next` when TS errors reference `.next/dev/types`.
- API dev server on port 3301 is slow — curl with `--max-time`.
- Do NOT add `middleware.ts` to AmazeCC-API (Next 16 renamed it; `src/proxy.ts` already
  handles CORS globally).
- amazeui: `button.flex-col` needs the globals.css fix; `ResponsiveButton` collapses
  label → icon; Modal API `{ isOpen, onClose, title, maxWidth, noPadding, className }`.
