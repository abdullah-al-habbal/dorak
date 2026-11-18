# 10 — Performance and Bundle

**Inspected:** code-splitting usage, what is shipped to the client on each page, rendering hot spots.
**Important:** I did **not** build the app or run a bundle analyzer. The findings below are structural (confirmed from code); their actual size impact is **unmeasured** and should be measured before any change.

---

## F-03 — All dialogs are imported eagerly into every portal page

- **Category:** Performance-related patterns / Unnecessary Dependency Chain
- **Risk:** 5/10 · **Priority:** P1 (start with a measurement) · **Scope:** the whole portal

**Files:** `src/components/overlays/overlay-host.tsx:3-42` statically imports ~40 dialogs; `overlay-provider.tsx` mounts `OverlayHost`; `components/layout/portal-session.tsx:21-28` wraps every portal page in `OverlayProvider`. A grep for `next/dynamic`, `React.lazy` and `lazy(` finds nothing in `src/`.

**What is wrong:** every portal page's client bundle contains every dialog and everything they import (forms, Zod schemas, mutation hooks, locale helpers), including admin-only dialogs that a barber or manager never opens. Dialogs open only on user action, which makes them ideal split points.

**Impact:** larger initial JS and slower hydration, growing with every new dialog (4+ were added in the last few features). Not a correctness or security issue (the backend remains the authority; bundles only contain UI code).

**Correction:** (1) measure with `next build` + the Next bundle analyzer; (2) if confirmed significant, load each case in `OverlayHost` with `next/dynamic` so a dialog loads on first open. The switch stays exhaustive and no call site changes.

**Independent.**

---

## F-04 — The full dictionary is sent to the client on every page

- **Category:** Performance-related patterns
- **Risk:** 4/10 · **Priority:** P2 · **Scope:** every route, including login

**Files:** `src/components/providers/locale-boundary.tsx:8-12` passes `DICTIONARIES[locale]` (all 40 namespaces; the English sources total ~107 KB raw) as a prop to the client component `I18nProvider`; therefore it is serialized into the RSC payload of each document load.

**What is wrong:** a page needing 2-3 namespaces receives all 40, and the login screen receives admin-catalog, payouts, and so on.

**Impact:** extra payload per full page load (gzip reduces it, and subsequent client navigations do not resend it). Not measured here.

**Correction:** only if measurement shows it matters: scope providers per route group (pass the namespaces the group needs), or split the dictionary by portal. Do not do this speculatively; the current design is simple and correct.

**Independent.**

---

## Inspected, no confirmed problems

- **Rendering:** no premature memoization; memo is limited to one documented component; `useNow` ticks only the booking grid.
- **Lists:** `placeholderData: keepPreviousData` via `useListQuery` avoids flicker when paging.
- **Query client defaults:** `staleTime` set, `refetchOnWindowFocus: false`, mutations do not retry (`lib/query-client.ts:17-18`). Reasonable.
