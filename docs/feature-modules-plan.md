---
nodeid: docs.feature_modules_plan
parentnode: docs.decisions
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
  - backend/modules/Dashboard/Routes/Api/V1/dashboard.php
---

# Dashboard: feature modules master plan

Routes: [documentation graph](index.md), [ADR 0003](adr/0003-new-dashboard-foundation.md), [ADR 0004](adr/0004-archive-legacy-dashboard.md).

Status: `IN PROGRESS`. `frontend/web/dashboard` is the only dashboard (the first one is archived, see ADR 0004). Built: layers 1-4 (API client, theme, i18n, auth, design system, shell), the allow-listed data proxy, and the core of Module 1 (Bookings: list, day and week grid, filters, status transitions). Module 1 is complete (walk-in, reschedule, history timeline, chair and hide-cancelled filters, shared list primitives under `components/ui/table` and `components/common`). Stylists (directory, chair/status filters, optimistic activate/deactivate, create/edit/delete) and Services (category-grouped catalog, price in minor units, duration, active toggle, create/edit/delete) are also built; the backend now exposes `chair`, `name_translations` and `category` on those lists and `GET /currencies` (see `backend/docs/feature-index.md`). The service form now has a category selector with inline create (`GET|POST /service-categories`). Working hours (`/working-hours`, split shifts, copy-to-days, sticky save bar) are built. Earnings (`/earnings`: revenue hero with trend, daily revenue and booking bars, sortable daily table, CSV export, URL-backed period) is built. This document is the audited plan for everything on top of the foundation.

The plan was written against the backend routes (`php artisan route:list --path=api/v1/dashboard`), the Form Requests under `backend/modules/Dashboard/Http/Requests/Business/` and the middleware groups in `Routes/Api/V1/dashboard.php`. Where the original brief and the backend disagree, the backend wins and the difference is listed in [Contract mismatches](#contract-mismatches).

## 1. Scope and non-goals

**Backend contract policy.** The backend is ours to change. When a module needs a field, filter or endpoint the backend lacks, the backend is changed (model, resource, request, action, with Pest tests and docs) instead of building a frontend workaround. The mobile apps share the API, so changes stay backward compatible or ship with the matching mobile change.

In scope: the provider tree, the allow-listed data proxy, and four modules (Bookings, Earnings, Services with branch working hours, Barbers/Stylists).

Not in scope: backend changes, realtime (Echo), notifications wired to the backend, a chart library, a calendar library, the admin-only areas (catalog, payouts, brands, settings) and the mobile apps. Any new dependency needs an explicit ask first (repo rule).

## 2. Providers and state architecture

### 2.1 Tree (outermost first)

```
<html>  PRE_PAINT_SCRIPT applies theme + dir before first paint
└─ Suspense (RouteProgress fallback)
   └─ LocaleBoundary            reads NEXT_LOCALE / Accept-Language on the server
      └─ I18nProvider           locale, direction, dictionary (hooks: useI18n, useDictionary)
         └─ AppProviders        QueryClientProvider, TooltipProvider, Sonner Toaster, theme sync
            └─ /dashboard/[guard]/(portal)/layout
               └─ Suspense → PortalSession   verifies the session at request time
                  └─ SidebarProvider        desktop collapse + mobile sheet
                     └─ OverlayProvider     one dialog/sheet host
                        └─ PortalShell → Header, Sidebar, <main>
```

### 2.2 Verified state of each provider

| Concern | Where | Notes |
| --- | --- | --- |
| Server cache | `QueryClientProvider` in `AppProviders` | Client is created once per mount with `useState(createQueryClient)`. 30s `staleTime`; no retry on 401/403. |
| Dictionary | `LocaleBoundary` → `I18nProvider` | The brief's "DictionaryProvider". The server is the source of truth for locale, so there is no locale store. |
| Theme | `useThemeStore` + inline `PRE_PAINT_SCRIPT` | **There is deliberately no `ThemeProvider` component.** A Zustand store plus a pre-paint script avoids a flash and avoids a cookie read in the root layout, which would block the static shell. `AppProviders` only syncs the `system` mode with `matchMedia`. |
| Toasts | Sonner `Toaster` in `AppProviders` | Reads the theme store. |
| Sidebar | `SidebarProvider` (this task) | Replaced the former global Zustand store. See 2.3. |
| Overlays | `OverlayProvider` (this task) | See 2.4. |
| Identity | `useAuthStore` | Holds the verified `/me` profile only, never a token. Hydrated by `SessionHydrator`. |

### 2.3 SidebarProvider

- `initialCollapsed` comes from the `sidebar_collapsed` cookie, read on the server in `PortalSession`, so the first paint already has the right width.
- Desktop collapse writes the cookie; mobile sheet state is memory only.
- The mobile sheet stores the pathname it was opened on and is open only while the pathname still matches. Navigating therefore closes it without an effect and without a store reset.
- A global store was removed because it is shared mutable state: it leaked between tests and could not be seeded per request.

### 2.4 OverlayProvider (the Modal/Sheet context)

- One host, one typed union. `OverlayRequest` (in `types/overlay-request.type.ts`) is a discriminated union keyed by `OverlayKind`. Today it only has `confirm`.
- Feature code calls `const { open, close } = useOverlay()` and never keeps a local `open` state or mounts its own `<Dialog>`.
- `OverlayHost` switches on `kind` with an exhaustive `never` check, so adding a kind without a renderer fails the typecheck.
- **How a module adds a form overlay**: add the member to the enum, add an interface such as `ServiceFormOverlayRequest { kind: OverlayKind.ServiceForm; mode: 'create' | 'edit'; id?: string }`, add it to the union, add the case in `OverlayHost`. Form overlays are loaded with `next/dynamic` so they do not enter the shell bundle. This was not done up front because a single `confirm` kind does not justify it, and a stub would be dead code.
- The confirm overlay locks while its action is pending, keeps itself open when the action rejects (the caller shows its own toast) and uses the destructive button variant when asked.
- Dialog vs sheet: forms with up to about six fields use a Dialog on `sm` and up; longer forms (working hours, booking detail) use a Sheet from the inline-end edge. Below 640px every overlay is a bottom-anchored sheet.

### 2.5 Ownership rules (apply to every module)

| State | Lives in |
| --- | --- |
| Anything fetched from the backend | TanStack Query (never copied into Zustand) |
| Filters, sort, page, selected date, view mode | URL search params (shareable, back-button safe) |
| Identity and actor | `useAuthStore` |
| Cross-page UI preference that survives a reload (theme, sidebar) | Cookie, seeded on the server |
| Ephemeral UI (open menu, hovered row) | Component state |
| Open dialog or sheet | `OverlayProvider` |

Cache Components note: anything that reads `cookies()`, `headers()` or `searchParams` must render under a Suspense boundary. Module pages read search params in a small client or server leaf behind their own Suspense with a skeleton fallback, not in the layout.

## 3. Allow-listed data proxy

`src/app/api/dashboard/[...path]/route.ts`, backed by `services/api/proxy/`.

### 3.1 Why it exists

The backend has no CORS configuration and the tokens live in HttpOnly cookies, so the browser cannot call Laravel directly. The proxy forwards only what the dashboard needs, with the session attached on the server.

### 3.2 Allow-list

A typed constant (`config/proxy-allow-list.constant.ts`) of `{ method, pattern, guards }`. The default is deny.

| Result | Status |
| --- | --- |
| Not signed in (no valid claim after one refresh attempt) | 401 |
| Path not in the list | 404 (does not reveal the backend surface) |
| Method not allowed for that path | 405 with `Allow` |
| Guard not permitted for that path | 403 |

The guard check reuses `AUTH_ACTORS` and `route-policy`. It is defence in depth: the backend remains the authority for authorization and branch scope, and the proxy never widens a permission.

Initial list (the real backend paths, see section 4):

| Methods | Pattern | Guards |
| --- | --- | --- |
| GET | `/overview` | admin, manager, owner |
| GET | `/bookings`, `/bookings/{id}`, `/bookings/{id}/history` | admin, manager, owner |
| PATCH | `/bookings/{id}`, `/bookings/{id}/cancel`, `/bookings/{id}/reschedule` | admin, manager, owner |
| POST | `/bookings/walk-in`, `/bookings/{id}/review` | admin, manager, owner |
| GET, PUT | `/branches`, `/branches/{id}` (PUT for working hours and the branch form) | admin, manager, owner |
| POST, DELETE | `/branches`, `/branches/{id}` | admin, owner (proxy rule; the backend also refuses a manager) |
| GET | `/brands` (the branch form's brand picker) | admin, owner |
| GET | `/earnings` | manager, barber, owner |
| GET, POST, PUT, DELETE | `/services`, `/services/{id}` | admin, manager, owner |
| GET, POST, PUT, DELETE | `/stylists`, `/stylists/{id}` | admin, manager, owner |
| PATCH | `/stylists/{id}/activate`, `/stylists/{id}/deactivate` | admin, manager, owner |
| GET | `/chairs` (the branch-assignment picker) | admin, manager, owner |
| GET | `/profile/notifications` | all |

The guard column mirrors `DashboardOperationsAuthorizationMiddleware` (rejects barbers) and `DashboardEarningsAuthorizationMiddleware` (rejects platform admins). It must be re-verified against the route file when each module starts.

### 3.3 Forwarding rules (as built)

- The forwarder is thin: the path, query string and JSON body are passed through unchanged. Laravel validates them. Nothing is renamed or reshaped.
- Request body: JSON only, capped at 256 KiB, parsed and re-serialised. `cookie`, `host` and hop-by-hop headers are never forwarded.
- Adds `Authorization: Bearer`, `X-Dashboard-Session`, `Accept-Language` (from the resolved locale) and `Accept: application/json`.
- 15s timeout, `cache: no-store`, redirects treated as failures (reuses `services/api/auth/backend-client.ts`).
- Session refresh stays in the browser client (`services/api/core/client.ts`): on a 401 it refreshes once through `/api/auth/refresh` and retries. The forwarder itself answers 401 `session_expired` and does not refresh.
- On success the backend `message`, `data` and `meta` come back unchanged. On failure, 422 becomes 400 `invalid_request` with `fields`, and 401, 403, 404 and 429 map to the dashboard error codes (`failure-map.util.ts`).

### 3.4 Envelope, pagination and errors

- Success parsing is done once, in `services/api/core/client.ts`, with Zod: `{success, statusCode, code, message, timestamp, data, meta}`.
- `meta.pagination` is parsed into `PageInfo { total, per_page, current_page, total_pages }` (`schemas/page-info.zod.ts`, the backend's own field names; `apiRequestWithMeta` returns it). Lists are fetched with `placeholderData: keepPreviousData` so paging does not flash a skeleton.
- Error mapping (`ApiClientError` carries `status`, `code`, `fieldErrors`, `retryAfter`):

| Status | Behaviour |
| --- | --- |
| 401 | Refresh once, then sign out to the login route with `callbackUrl`. |
| 403 | Forbidden state in the module area; the shell stays usable. Never a toast. |
| 404 | "Not found" state for a detail view; for a list item it means the row was removed, so the list is invalidated. |
| 409 | Conflict banner with a "Reload" action. The edited values are kept in the form. |
| 422 | `errors{field: [message]}` mapped to react-hook-form `setError`. Unknown fields become a form-level alert. Keyed on status plus `errors`, because the backend emits both `UNPROCESSABLE_ENTITY` and `VALIDATION_FAILED`. |
| 429 | Message with a countdown from `Retry-After`; the submit button stays disabled until it ends. |
| 5xx / network | Route `error.tsx` with a retry action for page loads; a toast for mutations. |

## 4. Contract mismatches

Found by comparing the brief with the backend. These are the decisions that need a human or a backend check before the affected module starts. Also recorded in [open decisions](decisions-required.md).

| Brief | Backend reality | Plan |
| --- | --- | --- |
| `/barbers` endpoint | **No such route.** Barbers are `stylists` (`/stylists`, `activate`, `deactivate`). | Resolved: the URL segment and proxy path are `stylists`, with no mapping. The UI label stays "Barbers". |
| `/working-hours` endpoint | Resolved. The backend now exposes `GET|PUT /branches/{id}/opening-hours` (dashboard), separate from the full branch PUT. | The editor reads and writes only the schedule. `PUT` replaces the listed days; the editor sends all seven. |
| Split shifts / breaks in working hours | Resolved. A day carries up to four non-overlapping `shifts`; `opens_time`/`closes_time` remain as the day's first open and last close for older clients. Overnight hours are still not representable (close must be after open on the same day). | The editor offers add, remove and copy-to-days per day; booking and slot checks require a booking to fit inside a single shift. |
| Statuses Pending / Confirmed / Completed / Cancelled | `BookingStatus` also has `in_progress` and `no_show`. | Six statuses, all live in the backend. Transitions follow `BookingStatus::canTransitionTo`; the UI offers only those, and never `pending` as a target. |
| Commission rules on a barber | `StylistRequest` has no commission field. Rules are `admin/commission-rules` (platform admin only). | Barbers module shows commission read-only for admin; other guards do not see it. No commission editing in this module. |
| Commission splits and trends in earnings | `ShowEarningsRequest` accepts only `from` and `to`. Whether the response has splits or a previous-period figure is **unverified**. | Verify the `ShowEarningsAction` response shape first. If there is no previous-period figure, the trend is computed by a second request for the equal preceding range; if that is not wanted, the indicator is hidden. |
| CSV export | No export endpoint. | Client-side, from the loaded and filtered rows. |
| Barber portal | Barbers are rejected by the Operations group (`/bookings`, `/overview`, `/stylists`, ...). Only `/earnings` and profile routes work. | Resolved 2026-11-07 (Module 8): the barber guard gets earnings and a read-only Schedule backed by the barber-scoped `GET /schedule/appointments` and `GET /schedule/hours` (see [Module 8](#10d-module-8-barber-schedule)). |
| Booking list has no calendar-window parameter | `date_from`, `date_to` exist. | The grid requests exactly the visible window, with `per_page=100` and follows the pagination metadata until complete. |

## 5. Shared conventions for all modules

- File taxonomy (from `src/README.md`): one `.type.ts`, `.interface.ts`, `.zod.ts` or `.enum.ts` per file; services under `services/api/query/*.query.ts` and `services/api/mutation/*.mutation.ts`; hooks one per file; tests under `tests/` mirroring `src/`. `@/` imports only, imports at the top.
- Zod schemas validate every response and every form. Types are inferred from schemas.
- Query keys come from one factory per module (`bookingKeys.list(filters)`, `bookingKeys.detail(id)`), never inline arrays.
- Mutations invalidate by key prefix; optimistic updates are limited to toggles (activate/deactivate, status change) and always roll back on error with a toast.
- Money is integer minor units plus a currency code; formatting uses `Intl.NumberFormat` with the active locale and `tabular-nums`. Floats are never used for money.
- Dates: the API is UTC; the branch time zone is used for display and slot math. Use `Intl.DateTimeFormat`; no date library is added.
- Every list view ships all of: skeleton (matching row height, shimmer disabled under `prefers-reduced-motion`), empty state with an action, filtered-empty state with a "Clear filters" action, error state with retry, forbidden state, and a pagination footer.
- Every mutation button uses `LoadingButton`; destructive actions go through the confirm overlay.
- i18n: each module adds a namespace in both `locales/en` and `locales/ar` (parity enforced by the `Dictionary` type). Logical CSS properties only (`ms-`, `me-`, `start-`, `end-`); direction-sensitive icons get `rtl:-scale-x-100`.
- Accessibility: visible focus, 44px touch targets on mobile, labelled controls, `aria-live="polite"` for result counts, no colour-only status (every badge has text).
- Design: tokens and the pole-stripe rule from `.interface-design/system.md`. The stripe is not reused in modules.
- Each module is a vertical slice and ends with `web-design-guidelines`, typecheck, lint, build and tests, then its own commit.

## 6. Module 1: Bookings

Route `/dashboard/[guard]/bookings`, guards admin, manager, owner (barber has no access, see section 4).

Backend: `GET /bookings` (filters `chair_id, date_from, date_to, per_page, booking_status, hide_cancelled, search, stylist_id`), `GET /bookings/{id}`, `GET /bookings/{id}/history`, `PATCH /bookings/{id}` (`booking_status`), `PATCH .../cancel`, `PATCH .../reschedule`, `POST /bookings/walk-in`, `POST .../review`.

Files (representative): `schemas/booking.zod.ts`, `schemas/booking-filters.zod.ts`, `schemas/walk-in-form.zod.ts`, `enums/booking-status.enum.ts`, `enums/booking-view.enum.ts`, `types/booking.type.ts`, `interfaces/booking-slot-layout.interface.ts`, `services/api/query/bookings.query.ts`, `services/api/mutation/{update-booking-status,cancel-booking,reschedule-booking,create-walk-in}.mutation.ts`, `lib/booking-keys.ts`, `lib/slot-layout.util.ts`, `components/bookings/*`, `hooks/use-booking-filters.ts`.

Views:
- **List** (default on mobile and under 640px): table on desktop, cards on phones. Columns: time, client, service, barber, chair, status, price.
- **Day grid**: columns are chairs (or barbers), rows are 15-minute slots, hour labels on the inline-start edge.
- **Week grid**: columns are days, events stacked and laid out side by side when they overlap.
- Switch (List / Day / Week) and the date navigator live in the URL (`?view=week&date=2026-11-04`). "Today" button; keyboard: arrow keys move the focused day or slot.

Grid mechanics: pure functions in `lib/slot-layout.util.ts` (tested): minutes-from-midnight placement in the branch time zone, overlap clustering with column assignment, clipping to the branch opening hours with a "Closed" hatch for closed days, a now-line only on today. Events shorter than 30 minutes render with a minimum height. Built as a CSS grid with `role="grid"`, `gridcell` and roving `tabindex`. No calendar library.

Status badges (existing variants): pending = warning, confirmed = info, in progress = info with a live dot, completed = success, cancelled = destructive-muted, no show = outline-muted. Always icon plus text.

Interactions: row or event opens a booking sheet (details, history timeline from `/history`). Status changes use `PATCH` with optimistic update. Cancel and no-show use the confirm overlay. Reschedule is a small dialog with date, time and a stylist/chair picker; the 422 for an unavailable slot is shown inline. Walk-in is a dialog, available from the header action.

Filters: status (multi), chair, stylist, search (debounced 300ms), date range. Each is a URL param; a filter bar with removable chips; "Clear filters".

States: skeleton rows or grid ghost blocks, empty ("No bookings in this period" with "Create walk-in"), filtered empty, error with retry, forbidden, and a stale indicator when a background refetch fails but data exists.

Edge cases: booking crossing midnight (clipped and continued), DST change inside the window (slot math uses the branch zone, not the offset), more than 100 results in a window (follow pagination, show progress), cancelled bookings hidden in the grid by default with a toggle, reschedule conflict (409 or 422), concurrent status change by another user (refetch on 409), RTL (time axis stays on the inline-start side, week starts per locale), Arabic digits via `Intl`, 4K (columns widen, text does not scale past a cap), phones (list only, no grid).

Tests: slot layout (overlap clusters, clipping, DST, midnight), filter param round-trip, status-to-badge map completeness, the reschedule/walk-in Zod schemas, mutation error mapping (422 to field errors).

Acceptance: all six statuses render; URL reproduces the view; every state above is reachable in the browser; no horizontal overflow at 390px and 3440px; RTL checked.

## 7. Module 2: Earnings

Route `/dashboard/[guard]/earnings`, guards manager, barber, owner (the backend rejects platform admins).

Backend: `GET /earnings?from&to`. Admin commission data is under `/admin/commission-entries` and belongs to a later admin module.

Files: `schemas/earnings.zod.ts` (written after verifying the response), `types/earnings-row.type.ts`, `services/api/query/earnings.query.ts`, `lib/date-range-presets.util.ts`, `lib/csv.util.ts`, `lib/currency-format.util.ts`, `components/earnings/{metric-card,earnings-table,date-range-filter,export-button,trend-badge}.tsx`.

Content:
- **Metric cards** (a row that wraps, not a fixed grid): revenue, average ticket (revenue divided by completed bookings, guarded against division by zero), commission/earned share, booking count. Each has a value, a label and a trend badge if a comparison is available. Cards differ in weight: revenue is the largest. They are not identical tiles.
- **Table**: sortable columns (click or Enter on the header; `aria-sort`), numeric columns right aligned with `tabular-nums`, sticky header, totals row, pagination if the response is paged.
- **Date range**: presets (Today, 7 days, 30 days, This month, Last month) plus a custom range with two native date inputs validated by Zod (`to >= from`, max 366 days). Presets are computed in the branch time zone. The range is in the URL.
- **CSV export**: client-side from the filtered rows. Cells beginning with `=`, `+`, `-`, `@`, tab or CR are prefixed with `'`; values are quoted and `"` doubled. UTF-8 with BOM so Arabic opens correctly in Excel. Filename `earnings_<from>_<to>.csv`. The button is disabled while loading or when there are no rows.

Trend logic: if the response has a previous-period value, use it; otherwise fetch the preceding range of equal length. A zero base shows "New" instead of a percentage. Direction is shown with icon and text, never colour alone.

States and edge cases: skeleton cards and table, empty period ("No earnings in this range"), error retry, forbidden for admin with a pointer to the admin area, currency mixing (if rows have different currencies, totals are shown per currency, never summed), very large numbers (compact notation on cards below 640px), refunds or negatives (shown with a minus sign, trend colours not inverted), range spanning DST.

Tests: preset ranges, CSV escaping (injection, quotes, commas, Arabic), average-ticket zero case, trend calculation, sort stability.

## 8. Module 3: Services and branch working hours

Route `/dashboard/[guard]/services`, guards admin, manager, owner.

Backend: `GET/POST /services`, `GET/PUT/DELETE /services/{id}`; `ServiceRequest` fields: `serviceable_id`, `serviceable_type`, `catalog_item_id` (nullable), `currency_code`, `name{en,ar}`, `price_amount_minor`, `duration_minutes` (1-1440, nullable), `is_active`, `is_at_home`. Working hours: `GET|PUT /branches/{id}/opening-hours` (`hours: [{day_of_week, is_closed | shifts[{opens_time, closes_time}]}]`).

Files: `schemas/service-form.zod.ts`, `schemas/opening-hours.zod.ts`, `enums/weekday.enum.ts`, `interfaces/opening-hours-day.interface.ts`, `services/api/{query/services.query.ts,mutation/{save-service,delete-service,save-opening-hours}.mutation.ts}`, `hooks/use-service-form.ts`, `hooks/use-opening-hours-form.ts`, `components/services/*`, `components/working-hours/*`.

Services:
- Table or card list grouped by category when `catalog_item_id` carries one (category data comes from the catalog; the manager guard cannot call `/admin/catalog-*`, so grouping falls back to a flat list if categories are not exposed to non-admin guards. Verify).
- Create/edit in the Dialog (overlay kind `service-form`): bilingual name (English and Arabic, both required, max 120), price as a decimal string input converted to minor units using the currency's minor-unit exponent, currency select, duration picker (presets 15/30/45/60/90/120 plus a number field, 1-1440), at-home toggle, active toggle.
- Validation is the Zod schema, mirrored from the Form Request. Server 422 errors are mapped on top.
- Delete goes through the confirm overlay. If the backend refuses because bookings reference the service, the 4xx message is shown in the dialog and the "Deactivate instead" action is offered.

Working hours (a tab or section inside the branch context; manager edits their own branch, admin and owner pick a branch first):
- Seven rows (Monday first or Saturday first per locale), each with a Closed toggle and open/close time inputs (`H:i`, 15-minute steps).
- **Copy to all days**: copies the chosen day's state to the other six. A confirmation toast with Undo (restores the previous form values) because it overwrites data.
- Validation: close after open (the backend rule), no overnight hours (not representable), at least one open day (a warning, not an error: a fully closed branch is legal).
- Dirty state: Save and Discard appear in a sticky bar; leaving with unsaved changes asks for confirmation.
- Sends the whole branch payload with the new `opening_hours` (see section 4).

States and edge cases: services skeleton, empty ("Add your first service"), error retry; price `0` allowed (backend `min:0`) with a "Free" label; duration null means "no fixed duration"; very long names truncate with a tooltip; saving a branch while another user changed it (409/422, reload prompt); RTL time inputs stay LTR (`dir="ltr"` on the time value) while labels flow RTL.

Tests: price string to minor units and back (rounding, locales, JPY-style zero-decimal currency), duration bounds, the opening-hours schema (close before open, duplicate days), copy-to-all with undo, payload builder for the branch PUT.

## 9. Module 4: Barbers (stylists)

Route `/dashboard/[guard]/stylists` (UI label "Barbers"), guards admin, manager, owner.

Backend: `GET/POST /stylists`, `GET/PUT/DELETE /stylists/{id}`, `PATCH /stylists/{id}/activate|deactivate`, `GET /chairs` for assignment. `StylistRequest`: `name{en,ar}`, `email` (unique), `phone` (nullable), `password` (min 12, optional on update), `status` (`pending|enabled|disabled`), `chair_id` (nullable). List filters: `search`, `per_page`.

Files: `schemas/stylist-form.zod.ts`, `enums/barber-status.enum.ts`, `types/stylist.type.ts`, `services/api/{query/stylists.query.ts,mutation/{save-stylist,delete-stylist,toggle-stylist}.mutation.ts}`, `components/stylists/*`.

Content:
- Directory: avatar (initials fallback), name in the active locale, contact, chair, status badge, an Active toggle. Search with debounce. Table on desktop, cards on phones.
- **Status toggle**: a switch that calls `activate` or `deactivate` with an optimistic update and rollback. Deactivate goes through the confirm overlay and explains that the barber stops receiving bookings. `pending` barbers show "Awaiting approval" and offer Activate only.
- **Branch assignment**: the backend models it through `chair_id`, which belongs to a branch. The form shows a chair select grouped by branch (admin and owner) or the manager's own branch. Showing "Branch" in the UI is derived from the chair.
- **Commission rules**: not editable here. Admins see the applicable rules read-only from `/admin/commission-rules`; other guards do not see the section. See section 4.
- Create: password is required and uses the same strength guidance as the backend (12+ characters). Edit: the password field is optional.
- Delete: confirm overlay; the 4xx for a barber with future bookings is shown with a pointer to deactivate instead.

States and edge cases: skeleton, empty ("Invite your first barber"), search-empty, error, forbidden (barber guard never sees this route: the nav hides it and the proxy returns 403), duplicate email (422 mapped to the email field), chair already taken (422 on `chair_id`), self-deactivation not applicable (barbers cannot reach this page), RTL names mixing Latin and Arabic (`dir="auto"` on name cells), long emails truncate with a tooltip.

Tests: form schema (both names required, email, password bounds on create vs update), optimistic toggle rollback, status-to-badge map, chair grouping.

## 10. Delivery order

1. Proxy and error layer (section 3). Prerequisite for everything. Includes the `PageInfo` mapper, `ApiClientError` extensions, the allow-list and tests with a mocked backend.
2. Shared list primitives: `DataTable`, `PaginationBar`, `FilterChips`, `EmptyState`, `ErrorState`, `TableSkeleton`, and the URL-params hook. Used by all four modules, so they are built once.
3. Stylists (smallest write surface, proves the form-overlay pattern).
4. Services (adds the money and duration inputs).
5. Working hours (needs the branch PUT verification).
6. Bookings (largest: grid math, many mutations).
7. Earnings (needs the response-shape verification, so it goes last to leave time for it).

Each step is a separate local commit with its own gates.

## 10a. Module 5: Manager Chairs and Reviews

Chosen 2026-11-05 as the next milestone: Modules 1-4 are built and the remaining sidebar items are Chairs and Reviews (manager), Schedule (barber), Branches, Payouts and Subscription (owner) and the admin areas. Chairs and Reviews have the smallest write surface and their backend routes already exist.

Audit of the backend (`php artisan route:list --path=api/v1/dashboard`), both behind the Operations guard group (admin, manager, owner), scoped by `DashboardActor::scopedBranchIds()`:

- Chairs: `GET|POST /chairs`, `GET|PUT|DELETE /chairs/{chair}`. `ChairRequest`: `branch_id` (required), `barber_id` (nullable, must belong to the branch), `label` (max 120), `floor_zone` (`men|women|shared`), `status` (`available|occupied|maintenance`), `layout_settings{position_x, position_y, width, height, rotation?}`, `force` (boolean). List filters: `search`, `per_page`. `ChairResource` returns `id, label, status, availability, floor_zone, layout_settings, branch_id, barber, created_at`.
- Reviews: `GET /branches/{branch}/reviews` (`per_page`), newest first; `ReviewResource` returns `rating, body, status, disputed_at, resolved_at, author_name, created_at`. Dispute resolution is admin-only (`/admin/reviews`) and stays out of scope.

Delivery, each a separate local commit with its own gates:

1. Chairs: proxy allow-list for `chairs` CRUD, schemas, queries, mutations, directory (zone and status badges, search, paging), create/edit dialog with a barber select and numeric layout fields, delete through the confirm overlay, Vitest, Playwright.
2. Reviews: proxy allow-list for `branches/{id}/reviews`, branch picker for multi-branch guards, rating summary, review list, Vitest, Playwright.

**Implemented: Chairs (dashboard, step 1).** `/dashboard/[guard]/chairs` for admin, manager and owner (barbers see the forbidden state; the proxy also denies them).

- Proxy: `GET|POST chairs`, `GET|PUT|DELETE chairs/{id}` for the Operations guards.
- List: `GET /chairs?search&branch_id&status&floor_zone&page&per_page`. Filters live in the URL (`search, branch, status, zone, page`). The row's badge shows the live `status`; the in-service switch and the edit form use `configured_status`, so an edit never writes the derived `occupied` back.
- Create and edit send the full `ChairRequest`. Decision: the dashboard does not edit floor-plan placement or the stylist assignment (stylists are assigned from the Stylists screen via `chair_id`). Edits resend the saved `layout_settings`; new chairs get a default placement (`DEFAULT_CHAIR_LAYOUT`) that the mobile layout editor refines. A branch select shows only for accounts that are not tied to one branch.
- Maintenance: the switch sends a full PUT with `status=maintenance`. The backend answers 409 while future reservation-blocking bookings exist; the proxy reports every 409 as the `conflict` code, so the UI offers a confirm and retries with `force=true`, which cancels and notifies those bookings. This confirm path is covered by code review only, not E2E, because the seeded bookings are time-of-day dependent.
- Deleting uses the confirm overlay; a chair with bookings is refused by the backend.

**Implemented: Reviews (dashboard, step 2).** `/dashboard/[guard]/reviews` for admin, manager and owner (barbers see the forbidden state).

- Backend gap fixed: `GET /dashboard/branches/{branch}/reviews` now returns `meta.summary {average, count, distribution{1..5}}` next to `meta.pagination`, computed by `BranchReviewSummary` over published and resolved reviews (the set behind the branch `rating_average`). Disputed and hidden reviews are still listed with a status badge but never counted. Additive for mobile, which does not call dashboard routes.
- Proxy: `GET branches/{id}/reviews` for the Operations guards. The URL holds `branch` and `page`; a branch select shows only for accounts that are not tied to one branch.
- UI: average and distribution cards (stars are decorative, the rating is also text), the review list (author, date via `Intl`, body as text) and paging. No rating filter: the backend has none and the plan does not call for one.
- E2E data: `E2eDashboardSeeder` seeds three counted reviews (5, 4, 2 stars, average 3.7) and one disputed review on the seeded branch's completed bookings.

Backend gaps are fixed in the backend (Pest plus docs) as they surface. Not in scope: a drag-and-drop floor-map editor and review dispute handling.

## 10b. Module 6: Owner Payouts and Subscription

Chosen 2026-11-07 as the next milestone. Remaining "Soon" items: Branches (owner, admin), Payouts and Subscription (owner), Schedule (barber, needs a new barber-scoped endpoint; shipped as Module 8) and the admin areas. Payouts and Subscription are read-only and their owner routes already exist behind `DashboardOwnerAuthorizationMiddleware`, scoped by `DashboardActor::scopedBrandIds()`, so they carry the smallest risk.

Backend audit (no contract gap found, no backend behaviour change):

- `GET /payouts?status&per_page&page`: the owner's own non-draft payouts, newest first, with `meta.pagination`. `OwnerPayoutResource` returns `id, status, direction_type, total_amount_minor, currency_code, brand{id,name}, period_started_at, period_ended_at, approved_at, paid_at, external_reference, created_at` and never admin notes or the approver. `status` is validated against `PayoutStatus`.
- `GET /subscription`: the latest subscription of each owned brand (brands without one are omitted): `status, brand, plan{name, description, price_amount_minor, currency_code, interval_unit, interval_count, feature_keys}, features{multi_branch, job_board}, starts_at, ends_at, past_due_at, grace_ends_at, cancelled_at`.

**Implemented (dashboard).**

- `/dashboard/owner/payouts`: status filter (approved, paid, cancelled; drafts are never offered) and page live in the URL; table on wide screens, cards on narrow ones; amounts through `Intl`; status is icon plus text.
- `/dashboard/owner/subscription`: one card per brand with plan, price per interval, status, a past-due notice with the grace end date, start and renewal dates, and the effective feature flags.
- Other guards see the forbidden state; the proxy allow-list opens `GET payouts` and `GET subscription` to the owner guard only (the admin payout and plan routes stay closed).
- Out of scope here: approving, paying or cancelling payouts and changing plans (admin-only; shipped as Module 9).
- E2E: `E2eDashboardSeeder` now seeds an owner (`e2e-owner@dorak.test`) for the manager's brand, an active plan with the `multi_branch` feature, and four payouts (paid, approved, cancelled, plus a hidden draft). The global setup saves a second session (`tests/e2e/.auth/owner.json`); owner specs use `test.use({ storageState: E2E_OWNER_STORAGE_STATE })`.
- Mobile: no impact. The mobile apps do not call these dashboard routes and no API contract changed.

## 10c. Module 7: Owner and Admin Branches

Chosen 2026-11-07 as the next milestone. Remaining "Soon" items after it: Brands, Catalog, Analytics and Settings (admin; both shipped as Module 10), Payouts (admin) and Schedule (barber; shipped as Module 8).

Backend audit (`php artisan route:list --path=api/v1/dashboard`), all behind the Operations guard group:

- `GET /branches?search&status&brand_id&per_page&page`, `GET|PUT|DELETE /branches/{branch}`, `POST /branches`. The list is scoped by `DashboardActor::scopedBrandIds()` and `scopedBranchIds()`; a branch outside the scope is 404 on reads and 403 on writes.
- `StoreBranchAction` and `DestroyBranchAction` require `DashboardActor::canManageBrand()` (platform admin, or an owner of that brand). A branch manager gets 403 and can only `PUT` their own branch. `PUT` keeps an owner's brand inside the brands they own.
- Rules: `BranchRequest` (`brand_id` uuid, `name{en,ar}` max 120, `email` unique, `status`, `universe`, `description{en,ar}`, `address{en,ar}`, `latitude`, `longitude`, `tags`, optional `opening_hours`); `password` is required on create and optional on update (min 12).
- Failures: 409 `CONFLICT` with a localized message for the brand's last active branch (disable or delete) and for a delete while bookings are upcoming; 403 `feature_not_enabled` when the brand's plan lacks `multi_branch` and it already has a branch, or when a non-original branch is edited after a downgrade (EC-6).
- Gap fixed in the backend: the list had only `search`. It now also accepts `status` (`pending|enabled|disabled`) and `brand_id` (uuid), validated, and still intersected with the actor's scope, so a filter can never widen access. Additive; mobile does not call dashboard routes.

**Implemented (dashboard).** `/dashboard/[guard]/branches` for admin and owner (manager and barber see the forbidden state; managers keep editing their own hours from Working hours).

- Proxy: `POST branches` and `DELETE branches/{id}` for admin and owner only, plus `GET brands` (admin, owner) for the brand picker. `GET|PUT` stay on the Operations guards.
- List: `status`, `brand` (shown when the account sees more than one brand), `search` and `page` live in the URL; the brand column appears under the same condition; rating is text, status is icon plus text.
- Create and edit use the `branch-form` overlay. Editing first loads `GET /branches/{id}` because list rows carry text in one locale only; saving without both translations loaded would erase the other language. Fields: brand (create only, and only when there is a choice), name (en, ar), login email, password (required on create, "leave empty to keep" on edit), status, audience, description and address (en, ar), latitude and longitude.
- The form never sends `opening_hours`, `tags` or the floor plan, so an edit leaves them as saved. Two empty translations are sent as `null`. The brand of an existing branch is not editable here.
- Delete goes through the confirm overlay. A 409 shows the backend's own reason in a toast; a 403 on save explains that the plan needs the multi-branch feature.
- E2E (owner session): list and filter, create, edit and delete, the last-branch refusal, and Arabic RTL. `E2eDashboardSeeder` now restores the seeded branch's name and status and deletes extra branches of the brand, so the specs can reset the real backend.
- Mobile: no impact. None of the three apps or the shared packages call `/dashboard/*` (they use `/branch/*`, `/explore/*` and the public `/branches/{id}/...` routes), and no existing contract changed.

## 10d. Module 8: Barber Schedule

Chosen 2026-11-07 as the next milestone. The Operations routes reject barbers (`DashboardOperationsAuthorizationMiddleware`), so the barber portal needed its own endpoints. Read-only: accepting, starting or completing a booking and editing the weekly hours stay in the stylist app.

Backend (new `DashboardBarberAuthorizationMiddleware` group, barbers only; managers, owners and admins get 403):

- `GET /schedule/appointments?booking_status&date_from&date_to&per_page&page`: the signed-in barber's own bookings, earliest first, as `StaffBookingResource` (same payload as `/bookings`) with `meta.pagination`. Dates are `YYYY-MM-DD` and inclusive of the whole day; `per_page` max 50 (default 15). The barber id always comes from the session (`DashboardActor::id`), never the request.
- `GET /schedule/hours`: the barber's weekly rows `{id, day_of_week (0 = Sunday), start_time, end_time, is_active}` (`HH:mm`), same field names as the mobile `/barber/schedule`. `barber_schedules` has a unique `(barber_id, day_of_week)`, so a day has at most one shift.
- Authorization: `BarberSchedulePolicy::viewOwn` (Gate on the dashboard actor) in addition to the middleware.

**Implemented (dashboard).** `/dashboard/barber/schedule`: appointment table (cards on phones) with `range` (today, this week, upcoming; default upcoming), `status` and `page` in the URL, a weekly hours card beside it (stacked below on narrow screens) with a day-off state, en and ar dictionaries, RTL and dark mode follow the shell. Other guards see the forbidden state; the proxy allow-list opens the two `GET` paths to the barber guard only. The nav item is no longer "Soon".

- E2E: `E2eDashboardSeeder` gives the seeded stylist Omar a known password and weekly hours (Mon to Wed, Thu switched off); the global setup saves a barber session (`tests/e2e/.auth/barber.json`) and `schedule.spec.ts` uses it.
- Mobile: no impact. The three apps and the shared packages never call `/dashboard/*` (the stylist app uses `/barber/schedule` and `/barber/appointments`), and no existing contract changed.

## 10e. Module 9: Admin Payout Approvals and Plan Management

Chosen 2026-11-07 as the next milestone. The admin payout, plan and brand-subscription endpoints already existed behind `DashboardAdminAuthorizationMiddleware` with Pest coverage (`PayoutTest`, `SubscriptionPlanTest`), so the audit found no missing endpoint. Three gaps were closed in the backend; all are additive and the mobile apps never call these routes.

Backend audit (`php artisan route:list --path=api/v1/dashboard/admin`):

- `GET /admin/payouts?status&brand_id&per_page&page`, `GET /admin/payouts/{id}`, `POST /admin/payouts/generate`, `PATCH /admin/payouts/{id}/(approve|mark-paid|cancel)` with optional `external_reference` (max 255) and `notes` (max 2000). State machine: draft to approved or cancelled; approved to paid or cancelled; paid and cancelled are final (409 `CONFLICT` otherwise). Cancelling releases the payout's commission entries for the next generation run. `PayoutPolicy` allows admins only.
- `GET|POST /admin/subscription-plans`, `GET|PUT|DELETE /admin/subscription-plans/{id}` (`SavePlanRequest`: bilingual name, price in minor units, `currency_code`, `interval_unit`, `interval_count` 1-120, `is_active`, `sort_order`, `feature_keys`), `GET /admin/plan-feature-keys`, `GET|POST /admin/subscriptions` (assigning replaces the brand's live subscription; an inactive plan is 422) and `PATCH /admin/subscriptions/{id}/status` (pending to active or cancelled; active to past_due or cancelled; past_due to active or cancelled; cancelled is final).
- Gap 1: the payout and subscription status handlers checked the state machine on the loaded model before the transaction, so two admins acting at once could both pass. They now re-read the row with `lockForUpdate` inside the transaction (`TransitionPayoutHandler`, `UpdateSubscriptionStatusHandler`).
- Gap 2: `GET /admin/subscriptions` gained a validated `status` filter (`ListBrandSubscriptionsRequest`, replacing the shared `ListPaginatedRequest`).
- Gap 3: `GET /admin/subscription-plans` gained a validated `is_active` filter (`ListSubscriptionPlansRequest`).
- Tests: `AdminBillingManagementTest` (admin-only access for every guard, the two filters, 404s, stale-model transitions refused).

**Implemented (dashboard).** The admin nav gains Plans and Subscriptions and Payouts is no longer "Soon".

- `/dashboard/admin/payouts` (same route the owner uses; the screen is chosen by guard): every status including drafts, URL-backed status filter and page, table on wide screens and cards on narrow ones. Each row offers only the moves the state machine allows; every move opens a dialog (optional notes; a transfer reference when marking paid) and shows the backend's conflict reason if another admin got there first. "Generate drafts" confirms first and reports when nothing is unsettled.
- `/dashboard/admin/plans`: list with an active/inactive filter, create and edit in one dialog (both languages, price in major units converted to minor units, currency, billing interval, display order, active switch, feature checkboxes from `GET /admin/plan-feature-keys`), delete with a confirmation. Deleting a plan with live subscriptions shows the backend's 409 message.
- `/dashboard/admin/subscriptions`: list with a status filter, per-row moves behind a confirmation (cancel is destructive), and an assign dialog (brand, active plan).
- The proxy allow-list opens the thirteen admin billing paths to the admin guard only; other guards see the forbidden state.
- E2E: the base `AdminSeeder` account (`admin@dorak.sy`) is saved as `tests/e2e/.auth/admin.json`; `E2eDashboardSeeder` adds an inactive plan and restores the two seeded plans on every reset; specs: `admin-payouts`, `admin-plans`, `admin-subscriptions`.
- Out of scope: commission rules and payment gateways (the other admin routes stay "Soon"); platform settings and analytics shipped as Module 10.
- Mobile: no impact. The three apps and the shared packages never call `/dashboard/*` and no existing contract changed.

## 10f. Module 10: Platform Analytics and Settings

Chosen 2026-11-07 as the next milestone. Both admin routes already existed (`GET /admin/analytics/overview`, `GET|PATCH /admin/settings`) with Pest coverage; the audit found two gaps and one scope question.

Backend audit (`php artisan route:list --path=api/v1/dashboard/admin`):

- Analytics had no period, no plan names and no booking mix, so a screen could only show all-time totals. `GET /admin/analytics/overview?from&to` (dates, `to` on or after `from`) now narrows `completed_bookings`, `bookings_by_status`, `completed_bookings_series`, commission (by `created_at`) and payouts (by `created_at`). Subscriptions and `platform {brands, branches, barbers, clients}` are live. `by_plan` gains `plan_name`. Every old key is unchanged.
- Settings bounds were checked per key only, so a default page size above the maximum, or a refresh lifetime below the session lifetime, could be saved. `UpdatePlatformSettingsRequest` now rejects both with a 422 on `settings.<key>`.
- Owner analytics: no new endpoint. The owner's brand-scoped revenue, trend and chart are Earnings (`/earnings`, `/overview`), and the earnings middleware already sends platform admins to analytics. Analytics is therefore admin only.

**Implemented (dashboard).** The admin nav enables Analytics and Settings; the proxy opens `GET admin/analytics/overview` and `GET|PATCH admin/settings` to the admin guard only.

- `/dashboard/admin/analytics`: the Earnings period picker (presets and custom dates, in the URL), a completed-bookings-per-day bar chart (the Earnings `BarChart`, zero-filled days), a booking status mix, money per currency (recurring revenue, pending and paid-out commission, payouts by status), subscriptions by plan and live platform totals. Loading, error, empty-period and forbidden states; RTL, dark mode and phone widths follow the shell.
- `/dashboard/admin/settings`: six groups (sign-in, bookings, billing, search, photos, floor plan), one numeric field per setting with its default and allowed range, a per-field "Default" reset, a save bar that is disabled until something changes, and a leave warning. Only changed settings are sent. Bounds and both cross-field rules are checked before the request and again from the backend's 422.
- E2E: `admin-analytics` and `admin-settings` specs (admin session). `E2eDashboardSeeder` clears `platform_settings` on each reset.
- Mobile: no impact. The three apps and the shared packages never call `/dashboard/*`, the analytics change is additive, and settings are only read server side.

## 10g. Module 11: Admin Brands (approval)

Chosen 2026-11-08, approve-only (see `docs/decisions-required.md`). Every endpoint already existed: `GET /brands` and `GET /brands/{brand}` (admin and owner, scoped by `canManageBrand`) and `PATCH /admin/brands/{brand}/approve`. The audit found three backend gaps, all closed additively:

- The approve action relied on middleware only. `BrandPolicy::approve` (an `AdminModel`) now guards it, and the Filament Approve button checks the same ability, so both approval paths share one rule. Policy actors are `mixed` so a denial is a 403, never a type error.
- The list read a raw request. `ListDashboardBrandsRequest` validates `status` (`pending|active`), `search` (max 100) and `page`, and still clamps `per_page`; `BrandPolicy::viewAny` (admin or brand owner) authorizes it.
- No way to list pending brands: the optional `status` filter, intersected with the owner scope.

**Implemented (dashboard).** The admin nav enables Brands; the proxy opens `GET brands/{id}` and `PATCH admin/brands/{id}/approve` to the admin guard only.

- `/dashboard/admin/brands`: the pending queue by default, a status select (pending, active, all) and a name search in the URL, rows with owner email, branch count, status (icon and text) and created date, Approve on pending rows behind the confirm overlay. A row opens the `brand-detail` overlay (both name translations, owner, currency, audience, slug, branches, description) with Approve for a pending brand. Approving invalidates the admin brand keys and the brand pickers. Other guards get the forbidden state.
- E2E: `admin-brands` (admin session, reset before each test). `E2eDashboardSeeder` seeds "E2E Pending Cuts" for a second owner, older than every other brand, and puts it back to pending on each reset; `admin-subscriptions` now picks that brand by name instead of by position.
- Mobile: no impact. The apps never call `/dashboard/*` and `BrandResource` is unchanged.

## 11. Cross-cutting concerns

- **Security.** Authorization stays on the backend. The proxy allow-list, guard checks and body caps are defence in depth. No token is ever readable by the browser. CSV export neutralises formula injection. Server-provided strings are rendered as text, never as HTML.
- **Performance.** Overlay forms and the grid are dynamically imported; lists use `keepPreviousData`; the grid is virtualised only if a window regularly exceeds 300 events (measure first); search is debounced; no request waterfalls (the branch and chair lookups are prefetched in parallel).
- **Resilience.** Network failures show a retry state; mutations are not auto-retried; the single-flight refresh prevents a refresh storm when several queries 401 together.
- **Observability.** `ApiClientError` carries the backend `code` and the request timestamp for support. No PII in client logs.
- **Testing.** Vitest in the Node environment covers the pure logic (schemas, mappers, slot layout, CSV, proxy policy). Component behaviour is verified in the browser. Adding `jsdom` and Testing Library would allow component tests; that is a dependency decision for the maintainers.

## 12. Open questions

Questions 1-3 and 5 were resolved on 2026-11-04; see [open decisions](decisions-required.md). Question 6 (chart library) is still open.

1. URL segment: keep `stylists` (consistent with backend and nav) or rename to `barbers`?
2. Does `PUT /branches/{id}` accept a partial payload, or must the whole branch be sent?
3. What does `GET /earnings` return (splits, previous period, paging)?
4. Are service categories readable by non-admin guards? (Resolved: the dashboard service response now carries `category`.)
5. Does the barber guard get a booking/schedule endpoint, or does it stay earnings-only? (Resolved 2026-11-07: read-only schedule endpoints, Module 8.)
6. Should a chart library be approved for the earnings module?
