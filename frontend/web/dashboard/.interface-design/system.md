# Dorak dashboard design system

## Direction
Calm, dense workbench for people on a shop floor. Cool ink-slate in the dark, lather-white paper in the light, one pole-blue accent.
Domain: chair, razor, lather, pole stripe, appointment book, brass fittings.

## Signature
The barber-pole stripe (`pole-stripe` utility). Only three places: the active nav indicator, the sign-in panel (turns continuously, one stripe tile per 1.4 s loop so the seam is invisible; still under `prefers-reduced-motion`; inset 32px from the panel's top and bottom and 64px from its end edge, mirrored in RTL) and the route progress bar. Never decoration elsewhere.

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

## Admin billing (payouts, plans, subscriptions)
- Money moves are a queue, not a form: each payout row shows only the buttons its status allows (draft: approve, cancel; approved: mark paid, cancel). Buttons sit in an `interactive` DataTable column, carry an `aria-label` naming the action, brand and period, and the destructive move uses the `destructive` variant.
- Every status change opens a dialog that restates what will happen and who it affects (brand and amount in one line); only "mark paid" asks for a transfer reference. A 409 means someone else moved the row first: say so inline, then refresh the list.
- Subscription moves and "generate drafts" use the shared confirm overlay; cancelling is destructive. Assigning a plan states that it replaces the current live subscription.
- Plan prices are typed in major units (`49.00`, Arabic-Indic digits accepted) and sent as minor units. Feature flags are native checkboxes with a 44px row; the active flag is a `Switch` inside the form (saved with the form, unlike the immediate stylist toggle).
- Admin screens reuse the filter pattern: native select, status and page in the URL, filtered-empty with a clear button.

## Admin brands (approval)
- The screen is a queue: it opens on pending brands (the default stays out of the URL), and "All statuses" is the last option, not the first. An empty queue says nothing is waiting rather than "no brands".
- A row opens a read-only detail dialog (both name translations side by side, identifiers `dir="ltr"` and `translate="no"`); Approve sits on pending rows and in the dialog footer, and always goes through the confirm overlay, which states that the brand becomes visible and cannot be moved back from the dashboard.
- Pickers that create something under a brand (new branch, assign a plan) offer approved brands only; lists and filters keep every brand so existing rows stay labelled. When nothing is approved, the new-branch dialog replaces the form with a waiting state (title, one-line reason, Close) rather than a form that cannot be submitted; the assign dialog shows the same inline status note as "no active plans".

## Platform analytics and settings
- Analytics reuses the Earnings period picker, URL contract and `BarChart`; the page is sections under `h2`s, not a wall of identical tiles. Bookings lead with the chart, money is one card per currency (never summed), and the platform size sits last because it is not tied to the period (its caption says so).
- `MeterRow` pairs every figure with a thin proportional bar; the number is the meaning, the bar is decoration (`aria-hidden`).
- Settings are grouped cards (`role="group"` named by the heading). Each field shows its default and allowed range under the input, and a per-field "Default" button. The sticky save bar says "unsaved changes" or "all saved" in a live region and the form warns before the tab closes.
- Labels and units come from the dictionary keyed by `setting_key`, so a new backend setting shows its raw key until copy is added.

## Admin catalog (global categories)
- One table of top-level categories; the row opens a read-only detail dialog (figures in a `dl`, subcategories as status chips, the first 50 catalog items under "Read only. Catalog items are created and edited in the admin panel."). Edit is a separate outlined row button and also sits in the detail footer. Subcategories and items are never editable here.
- Counts (catalog items, services) are right-aligned tabular numbers; a subcategory count rides under the name as muted meta text, not a column.
- The active `Switch` follows the toggle rule: switching on is instant, switching off opens the confirm overlay, which states what it does not do (catalog items stay visible to clients). The same caveat sits under the page description with an info icon, because "deactivate" reads like "unpublish".
- Delete appears in the edit dialog only for an empty category. For one in use, the button is replaced by a sentence explaining why and pointing to deactivation, never a silently disabled button. The backend still answers 409, surfaced as a toast.
- The list is not paginated (the whole taxonomy fits), so filters live in the URL through `useUrlState`, not `useUrlFilters`. The empty (unfiltered) state offers "New category".

## Password recovery and account page
- Forgot, reset and sign-in share `AuthShell` (form column plus brand panel) and `PasswordInput` (reveal toggle with an `aria-pressed` label). The pole stripe stays in its three places.
- Forgot answers with one calm card ("Check your email") whether or not the address exists; the wording never confirms an account. A dead reset link is a `role="alert"` card with one action, "Ask for a new link".
- The account page is five grouped cards (`role="group"` named by an `h2`) under one `h1`, in a `max-w-3xl` column: Profile, Email, Password, Notifications, Language. Forms are label above, inline error, a single primary button at the start edge, disabled until the form is dirty where saving nothing makes no sense.
- The email change is two steps in one card: current address shown read-only, then either the new-address form or the 6-digit code form (monospace, tabular, `autocomplete="one-time-code"`), with "Use a different email" always available.
- Notification rows are switch rows (label, one-line hint, `Switch` named "<setting> notifications") that flip at once and roll back with an error toast. Language is a native select, so mobile gets the system picker and RTL works for free.
