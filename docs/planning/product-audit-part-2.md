---
nodeid: docs.audit.part-2
parentnode: docs.audit
childnodes: []
codeanchors:
  - backend/modules/
  - frontend/web/dashboard/src/
  - frontend/mobile/apps/
---

# Audit Workflow Matrix

Part 2 of 3 · [Overview](product-audit.md) · [Findings](product-audit-part-3.md)

| Role | Workflow | Backend | Frontend | Conf. |
|---|---|---|---|---|
| Admin | Catalog CRUD | OK | Dashboard | high |
| Admin | Subscriptions, gateways, commissions, payouts, analytics, settings | OK | Dashboard | high |
| Admin | Dispute resolution | OK | Page exists; managers and stylists raise disputes from the mobile apps (G3 resolved) | high |
| Admin | Activate barber/branch, bans, clients | OK | Filament only | confirmed |
| Admin | Brand verification | No status or route (G2) | Filament record only | confirmed |
| Owner | Create brand, then branch | OK | Dashboard, client app | high |
| Owner | Floor plan, chairs, stylists, affiliations, jobs | OK | Dashboard (floor plan is a form, not a canvas) | high |
| Owner | Services, price, duration | Brand level, plus per-brand override of a barber's price and duration (G6 resolved) | Dashboard | confirmed |
| Owner | Bookings search and filter, reviews | OK | Dashboard | high |
| Owner | Subscription, features, earnings, payouts | `GET /dashboard/subscription`, `/earnings`, `/payouts` (G4 resolved) | Dashboard | confirmed |
| Manager | Bookings, chairs, floor plan | OK | business_app, dashboard | high |
| Manager | Opening hours | OK | No screen (G10) | reported |
| Manager | Services, staff list, dispute, inbox | Dashboard only | No screen (G10) | reported |
| Stylist | Login, signup, approval | OK | stylist_app | high |
| Stylist | Schedule, today's appointments, lifecycle | OK | stylist_app | high |
| Stylist | Portfolio, profile, jobs, affiliations | OK | stylist_app | high |
| Stylist | History media before/after/reference | `POST /barber/history/{history}/media`; stylist_app client history screen (G1 resolved) | stylist_app | confirmed |
| Stylist | Own services, price | OK | No screen (G11) | reported |
| Stylist | Past appointments, earnings, inbox | Earnings API `GET /dashboard/earnings` (G4); appointments today only, no mobile earnings screen (G11) | Dashboard (earnings) | reported |
| Client | Auth, discover, book (incl. at-home), cancel, review, favorites | OK | client_app | high |
| Client | Brand hiding, preferences, media type picker | OK | client_app | high |
| Client | Phone verification | Log-only SMS (G5) | UI exists | confirmed |
| Client | Social login | Route live, no credentials | No UI | confirmed |
| Client | Barber reviews, edit history entry | Barber reviews used by stylist_app; client history edit endpoint kept, client code removed (G12 resolved) | stylist_app | confirmed |
