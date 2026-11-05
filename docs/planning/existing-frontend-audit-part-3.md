---
nodeid: docs.audit.frontend.part-3
parentnode: docs.audit.frontend
childnodes: []
codeanchors:
  - archive/frontend/legacy-dashboard/src/config/routes.constant.ts
  - archive/frontend/legacy-dashboard/src/services/api/dashboard/shared/dashboard-path.constant.ts
  - archive/frontend/legacy-dashboard/src/services/api/dashboard/shared/schemas/
---

> **Historical.** This document describes the first dashboard, archived at
> `archive/frontend/legacy-dashboard/` (see [ADR 0004](../adr/0004-archive-legacy-dashboard.md)). The active
> dashboard is `frontend/web/new-dashboard/`.

# Frontend Routes, Endpoints and Data Models

Part 3 of 4 · [Previous](existing-frontend-audit-part-2.md) · [Next](existing-frontend-audit-part-4.md)

## Page routes by actor

| Route | Admin | Owner | Manager | Barber |
| --- | --- | --- | --- | --- |
| `overview`, `bookings` (+`create`, `[id]`) | yes | yes | yes | no |
| `branches` (+`[id]`, `[id]/edit`) | yes | yes | yes | no |
| `branches/create` | yes | yes | no | no |
| `chairs`, `services`, `stylists` (+create, `[id]`, edit) | yes | yes | yes | no |
| `floor-plan`, `reviews`, `affiliations`, `job-postings` | yes | yes | yes | no |
| `brands` | yes | yes | no | no |
| Platform pages (below) | yes | no | no | no |
| `/barber` workspace | no | no | no | yes |
| `profile/*` (4 tabs) | yes | yes | yes | yes |

- Admin platform pages: `catalog-items`, `disputed-reviews`, `exchange-rates`, `subscription-plans`, `subscriptions`, `payment-gateways`, `commission-rules`, `payouts`, `analytics`, `settings`.
- Public: `/`, `/forbidden`, `/{actor}/login` for four actors.

## BFF routes (browser to Next)

- `/api/auth/{login,logout,refresh}`; `/api/dashboard/[...path]`; `/api/barber/[...path]`.
- `/api/lookups/[resource]` for `brands`, `currencies`, `service-catalog-items`.
- `/api/notifications/[[...path]]`, `/api/realtime/auth`, `/api/health`.
- The dashboard and barber proxies reject any method and path not matched by an allowlist regex (404). Profile and settings bodies are re-mapped.

## Backend endpoints consumed

- Entities: `overview`; `bookings` (list, show, history, walk-in, status patch, cancel, reschedule, client review); `branches`, `chairs`, `services`, `stylists` CRUD; stylist activate and deactivate.
- Branch sub-resources: floor plan get and patch; reviews; affiliations list, invite, accept, reject, terminate; job postings CRUD; applications list and status patch.
- Admin: reviews and resolve; exchange rates; catalog items CRUD, categories, tags; plans CRUD and feature keys; subscriptions list, assign, status; gateways CRUD and active toggle; commission rules CRUD and entries; payouts list, show, generate, approve, mark-paid, cancel; settings get and patch; analytics overview.
- Brands list, show, create, update.
- Profile: get and patch; email change and verify; password; notification preferences; settings.
- Barber: profile, portfolio (list, upload, delete), schedule, today's appointments, travel radius, workstation status, booking accept, start, complete, no-show, cancel.

## Core domain models (zod)

- **Branch**: id, brandId, email, lat, lng, localized name, description, address, tags, 7-day openingHours, rating average and count, status `pending|enabled|disabled`, universe `men|women|unisex`.
- **Chair**: id, branchId, barberId, floorZone `men|women|shared`, label, status `available|occupied|maintenance`, position, size, rotation.
- **Service**: localized name, price in minor units, currencyCode, durationMinutes, isActive, isAtHome, catalogItemId, serviceable (`brand|barber`).
- **Stylist**: localized name, email, phone, chairId, status `pending|enabled|disabled`.
- **Booking**: barber, chair, client with reputation, services, startsAt, endsAt, status `pending|confirmed|in_progress|completed|cancelled|no_show`; status log with actor type.
- **People**: affiliation (status, commission percent), job posting (bilingual, status), application (rating, portfolio count).
- **Money**: plan, subscription, gateway, commission rule and entry, payout, analytics totals.
- **Moderation**: disputed review, exchange rate. **Catalog**: item, category, tag, face shapes, hair textures.
- **Platform setting**: key, group, integer value with default, min, max.
- **Session**: actor, role, subject, branchId, brandId, brandIds, displayName, email, permissions.
- **Envelope**: success, statusCode, code, message, data, meta, errors; list pages are `{items, pagination}`.
- **List params**: page, perPage, search, status, dateFrom, dateTo, chairId, stylistId.
