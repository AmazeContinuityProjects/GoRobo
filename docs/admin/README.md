# GoRoBo Admin & Ops System — Docs Index

Detailed plans, ideas, and specs for the GoRoBo inventory / bill-processing / wallet
administration feature. Spans three repositories:

| Repo | Role | Live URL |
|---|---|---|
| `GoRobo` | Customer-facing storefront (static export) | — (local, `output: 'export'`) |
| `AmazeCC-API` | Next.js 16 API backend (Postgres via `pg` Pool) | https://amazecc-api.vercel.app |
| `AmazeCC-Dashboard` | Admin portal ("AmazeCC Admin", static export, single-page shell) | https://admin.amazecc.com |

## Documents

- [01-overview.md](./01-overview.md) — feature overview, goals, roles, permission model
- [02-data-model.md](./02-data-model.md) — schema changes: items, orders, wallet entries
- [03-api-routes.md](./03-api-routes.md) — full API route specs (public + admin)
- [04-quote-math.md](./04-quote-math.md) — quote formula and accounting math
- [05-dashboard-ui.md](./05-dashboard-ui.md) — AmazeCC-Dashboard UI: sidebar, tabs, components
- [06-pdf-generation.md](./06-pdf-generation.md) — jsPDF BOM and wallet-history exports
- [07-implementation.md](./07-implementation.md) — step-by-step implementation checklist + verification

## Status

Feature being implemented. Docs updated as the implementation lands.
