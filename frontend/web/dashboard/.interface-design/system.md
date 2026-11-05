# Dorak dashboard design system

## Direction
Calm, dense workbench for people on a shop floor. Cool ink-slate in the dark, lather-white paper in the light, one pole-blue accent.
Domain: chair, razor, lather, pole stripe, appointment book, brass fittings.

## Signature
The barber-pole stripe (`pole-stripe` utility). Only three places: the active nav indicator, the sign-in panel (turns once on load) and the route progress bar. Never decoration elsewhere.

## Tokens
Defined in `src/app/globals.css`. Domain names (`--ink`, `--lather`, `--pole-blue`, `--pole-red`, `--brass`) feed the shadcn names. Light under `:root`, dark under `.dark`; one hue (262), only lightness shifts between surfaces.

## Depth
Light: layered transparent shadows (`shadow-lift` for cards, `shadow-float` for overlays). Dark: hairline `rgba(255,255,255,.08)` borders. Sidebar shares the canvas colour. Inputs are inset and darker than their surface.

## Type
Bricolage Grotesque (display), Instrument Sans (body), IBM Plex Sans Arabic for AR. Tabular numbers on data (`.tabular`). Headings balance, body text wraps with `pretty`.

## Spacing and shape
4px base. Radius scale 6 / 10 / 14 / 18. Cards pad 20px (16px small). Controls: 36px default, 40px inputs, 44px large.

## Motion
Under 300ms, custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`, transform and opacity only. Press scale 0.97. Theme switch cross-fades colours for 260ms. `prefers-reduced-motion` removes movement.

## Components
- Button: 36px h, 14px/500, primary has an inset highlight and a soft ring on hover.
- Sidebar: 264px expanded, 68px collapsed, pole-stripe indicator on the active item. Pages not built yet show a "Soon" tag.
- Header: 64px, blurred background, breadcrumbs left, language / theme / notifications / account right.
- Forms: label above, inline error under the field, form-level error in a `role="alert"` banner.
- Overlays: every dialog or sheet opens through `useOverlay().open(...)`, never local `open` state. Confirm dialogs lock while pending, use the destructive button for destructive actions, and stay open if the action fails. Forms up to about six fields use a dialog; longer ones a sheet; under 640px all overlays anchor to the bottom.
- Sidebar state: desktop collapse is cookie-seeded on the server; the mobile sheet closes on navigation.

## Lists and forms (bookings module)
- Lists use `DataTable` (`components/ui/table`): a real `<table>` from `md`, stacked labelled cards below. Rows are a single button with a stretched hit area; never nest interactive elements in a row.
- Every list wires `TableSkeleton`, `EmptyState` (empty / filtered / forbidden), `ErrorState`, `FilterChips` (removable, one "Clear all") and `PaginationBar` (URL `?page=`, or an `onPageChange` override).
- Forms (walk-in, reschedule) are dialogs with react-hook-form + a Zod schema built from the dictionary. Backend 409/422 map to inline field errors (`mapBookingFormError`); anything unmapped goes to the `role="alert"` banner. Date-times use native `datetime-local` (local time in, UTC ISO out).
- Logical properties only; shadcn close buttons and menu offsets were converted to `end-*` / `ms-*` / `ps-*`.

## Toggles and grouped catalogs (stylists, services)
- `Switch` (Base UI) is for an immediate on/off setting and always has an `aria-label` naming the row. On means enabled; a `pending` stylist reads off and can only be switched on. Turning something off goes through the confirm overlay; turning it on is instant. Updates are optimistic with rollback.
- `DataTableColumn.interactive` marks a cell that holds its own control. In the table it sits above the row's stretched hit area (`z-10`); on narrow screens it renders beside the row button, never inside it.
- Services are grouped by catalog category (alphabetical, "Other services" last), one `DataTable` per group under an `h2`. Prices of 0 read "Free"; no duration reads "Flexible".

## Earnings (reports)
- Revenue is the focal element: display-size `font-heading` figure with a trend badge, and a quiet `dl` of supporting figures (bookings, average ticket, commission, net) beside it, not identical tiles. One currency at a time (`CurrencySwitch`); totals are never summed across currencies.
- Trend badges always pair an icon with words; a zero base reads "New", never an infinite percent.
- Charts are dependency-free flex-row bars (`bar-chart.tsx`): `role="img"` with a text summary, hover/touch readout, weekly buckets above 62 days. Bars use `bg-primary` (revenue) and `bg-chart-2` (bookings). The daily table carries the same numbers for keyboard and screen-reader users.
- The period lives in the URL (`?from&to`); the default (last 30 days) keeps the URL clean. Presets are chips, custom dates are native fields validated before they reach the URL.
- CSV: one row per day and currency, revenue in major units, formula-prefixed cells escaped, UTF-8 BOM.
