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
| GET, PUT | `/branches`, `/branches/{id}` (PUT for working hours) | admin, manager, owner |
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
| Barber portal | Barbers are rejected by the Operations group (`/bookings`, `/overview`, `/stylists`, ...). Only `/earnings` and profile routes work. | The barber guard gets earnings only. The "schedule" nav item has no data source and stays marked "Soon" until a barber-scoped endpoint exists. Backend gap, not fixed here. |
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

Backend gaps are fixed in the backend (Pest plus docs) as they surface. Not in scope: a drag-and-drop floor-map editor and review dispute handling.

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
5. Does the barber guard get a booking/schedule endpoint, or does it stay earnings-only?
6. Should a chart library be approved for the earnings module?
