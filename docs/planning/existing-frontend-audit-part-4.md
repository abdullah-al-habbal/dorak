---
nodeid: docs.audit.frontend.part-4
parentnode: docs.audit.frontend
childnodes: []
codeanchors:
  - frontend/dashboard/src/components/
  - frontend/dashboard/src/services/api/
  - backend/modules/Dashboard/Http/Actions/
---

# Forms, Workflows and Findings

Part 4 of 4 · [Previous](existing-frontend-audit-part-3.md) · [Overview](existing-frontend-audit.md)

## Form validation rules to preserve

- **Branch**: name en/ar 2-120; brandId uuid; email; password 12-255 (optional on edit); lat -90..90, lng -180..180; status; universe; description 2000 and address 255 per language; 7 opening days (HH:mm, close after open).
- **Chair**: label 1-120; branchId; barberId nullable; zone; status; position and size numbers; width and height positive.
- **Service**: name en/ar 2-120; price at least 0; duration 1-1440 or null; currency; isActive; isAtHome; serviceable id and type; catalog item nullable.
- **Stylist**: name en/ar; email; phone 7-30 or null; chairId nullable; status; password 12-255 on create.
- **Walk-in booking**: branch, chair, optional barber, customer name, email, optional phone, at least one service, start time.
- **Booking**: reschedule (start and end, end after start); status in `confirmed|in_progress|completed|no_show|cancelled`; client review rating 1-5, body 1000.
- **Floor plan**: preset, zones as percentages, canvas size and unit, decorations; `unisex_zoned` needs a men and a women zone.
- **Affiliation invite**: barberId, commission percent. **Job posting**: bilingual title and description, location, type, status.
- **Admin**: plan (bilingual, price, interval, features), assignment (brand and plan), gateway, commission rule, catalog item, platform settings (bounded integers), dispute resolve (status, note), payout generate.
- **Account**: display name, email change with 6-char code, password with 12-char minimum and confirmation, notification toggles, settings (language, theme, currency, price display).
- **Barber**: schedule (7 day slots, at least one), travel radius 0-100 km, bilingual bio 2000, cancel reason required.

## Workflows

- Booking list filters: status, date range, chair, stylist, client-name search; realtime refresh from the branch channel.
- Booking detail: status transitions defined in `booking-status-transitions.constant.ts`; history timeline; cancel, reschedule, client review.
- Stylist activate and deactivate with a reason; chair maintenance conflict dialog.
- Barber workspace: appointments, accept/start/complete/no-show/cancel, schedule, travel radius, workstation online toggle, portfolio, bio, realtime refresh.
- Notification bell with inbox, mark one and mark all read.
- Selected-branch picker for owners and admins; network health banner; session expiry redirect.

## Findings

| # | Finding | Grade |
| --- | --- | --- |
| F1 | Manager lacks `branches/create` in UI and backend alike (consistent). Brand create is Owner-only; Admin UI hides it. | confirmed |
| F2 | Service form allows `serviceable_type=barber`, but non-Admin actors are rejected for it by the backend. | confirmed |
| F3 | Stylist form allows an empty chair, yet non-Admin create returns 422. | confirmed |
| F4 | Dashboard has no branch-side review dispute or stylist review/dispute UI; both exist as backend routes and in mobile (Gap G3). | confirmed |
| F5 | Nav icons are all `home`, and `permissions` only carries `dashboard`; no fine-grained client permission model exists. | confirmed |
| F6 | Backend `DELETE` routes exist for services, chairs, stylists and branches; manager rights differ per resource, so UI must hide actions by role. | confirmed |
| F7 | Login does not distinguish an ineligible Owner (no brand, unverified) from bad credentials; both return invalid credentials. | confirmed |

## Rebuild checklist

- Keep the BFF, cookies, claim verification and per-portal server check.
- Re-derive UI permissions from role plus scope, not from `permissions`.
- Mirror every zod bound above, and keep EN and AR parity.
- Decide F2, F3 and F4 before building forms; record them in `docs/decisions-required.md`.
