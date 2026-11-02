---
nodeid: docs.audit.part-2
parentnode: docs.audit
childnodes: []
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Audit Workflow Matrix

Part 2 of 3 · [Overview](product-audit.md) · [Findings](product-audit-part-3.md)

| Role | Workflow | Backend | Frontend | Conf. |
|---|---|---|---|---|
| Admin | Catalog CRUD | OK | Dashboard | high |
| Admin | Subscriptions, gateways, commissions, payouts, analytics, settings | OK | Dashboard | high |
| Admin | Dispute resolution | OK | Page exists, nothing raises disputes (G3) | high |
| Admin | Activate barber/branch, bans, clients | OK | Filament only | confirmed |
| Admin | Brand verification | No status or route (G2) | Filament record only | confirmed |
| Owner | Create brand, then branch | OK | Dashboard, client app | high |
| Owner | Floor plan, chairs, stylists, affiliations, jobs | OK | Dashboard (floor plan is a form, not a canvas) | high |
| Owner | Services, price, duration | Brand level only (G6) | Dashboard | high |
| Owner | Bookings search and filter, reviews | OK | Dashboard | high |
| Owner | Subscription, limits, earnings | No API (G4) | None | confirmed |
| Manager | Bookings, chairs, floor plan | OK | business_app, dashboard | high |
| Manager | Opening hours | OK | No screen (G10) | reported |
| Manager | Services, staff list, dispute, inbox | Dashboard only | No screen (G10) | reported |
| Stylist | Login, signup, approval | OK | stylist_app | high |
| Stylist | Schedule, today's appointments, lifecycle | OK | stylist_app | high |
| Stylist | Portfolio, profile, jobs, affiliations | OK | stylist_app | high |
| Stylist | History media before/after/reference | Client-only route (G1) | None | confirmed |
| Stylist | Own services, price | OK | No screen (G11) | reported |
| Stylist | Past appointments, earnings, inbox | Today only, no earnings (G11) | None | reported |
| Client | Auth, discover, book (incl. at-home), cancel, review, favorites | OK | client_app | high |
| Client | Brand hiding, preferences, media type picker | OK | client_app | high |
| Client | Phone verification | Log-only SMS (G5) | UI exists | confirmed |
| Client | Social login | Route live, no credentials | No UI | confirmed |
| Client | Barber reviews, edit history entry | OK | No caller (G12) | reported |
