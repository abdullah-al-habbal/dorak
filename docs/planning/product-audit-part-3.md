---
nodeid: docs.audit.part-3
parentnode: docs.audit
childnodes: []
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Audit Findings

Part 3 of 3 · [Overview](product-audit.md) · [Matrix](product-audit-part-2.md)

| ID | Sev. | Finding |
|---|---|---|
| G1 | Major | **Resolved.** Stylists upload and tag (before/after/reference) history media on visits assigned to them via `POST /barber/history/{history}/media` (403 for anyone else's visit); stylist_app offers it from completed appointment cards and the client history screen. |
| G2 | Major | Brands have no status; any verified client can create a brand and become an owner. |
| G3 | Major | **Resolved.** business_app and stylist_app now list reviews and let a manager or stylist dispute a published one (reason 10–1000 characters); admins resolve in the dashboard. |
| G4 | Major | Owner, manager and stylist cannot see plan limits, earnings or payouts; those APIs are admin-only. |
| G5 | Major | Phone OTP uses the log-only SMS driver, so it is not launch-ready. |
| G6 | Medium | Owners cannot set a barber's price or duration; non-admin writes are brand level. |
| G7 | Medium | **Resolved.** `EnsureBranchAccountAccess` returns 403 `ACCOUNT_NOT_ACTIVE` for any branch that is not enabled, on every `auth:branch_api` route except logout. `EnsureBarberAccountAccess` (active scope) also blocks a branch-managed barber while the managing branch is disabled. |
| G8 | Medium | **Resolved.** `POST /barber|branch/forgot-password`, `/reset-password` (6-digit emailed code, 422 for wrong/expired/unknown, tokens revoked on reset), `/logout` (current token) and `/refresh-token` (rotates the token, 403 when deactivated). business_app and stylist_app have a forgot-password flow; logout revokes the server token; the session renews its token on start. |
| G9 | Medium | Social login links an existing client by email without checking the provider's verified flag; latent while no credentials exist. |
| G10 | Medium | business_app has no screens for services, opening hours, staff list, dispute or notifications. |
| G11 | Medium | Stylists see only today's appointments and have no inbox, settings, earnings or service editing. |
| G12 | Low | Unused client code: barber reviews, history update, `/explore/branches`, `/explore/barbers`, categories; saved addresses are local only. |
| G13 | Low | Dashboard polish: all nav icons are `home`, `.name.en` shown in Arabic, nested fields dropped on detail pages. |
| G14 | Low | `business_app` and `stylist_app` AGENTS.md were stale (fixed with this audit). |
| G15 | Low | Duplicate endpoints; `PATCH /chairs/{id}` lists `auth:client` but the policy always denies it; Sanctum abilities are never checked. |
| G16 | Nit | About 20 localization keys are unused. |

G5, G7, G8 and G9 are launch-readiness or security work and need no product call. The rest need the decisions listed in [open decisions](../decisions-required.md).
