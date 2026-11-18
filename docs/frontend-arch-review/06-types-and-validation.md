# 06 — Types and Validation

**Inspected:** `any` usage, `as` casts (all 54 non-`const` casts reviewed), schema/type relationship, form schemas, bilingual-field helpers.

## Overall verdict

Strong. Zero explicit `any`. Runtime schemas are the single source of truth and types are derived (`z.infer`, 86 places; for example `types/platform/website-content.type.ts` derives everything from `schemas/platform/website-content.zod.ts`), so there is no type/schema duplication. Of the 54 casts, the `as Record<string, unknown>` ones follow a `typeof … === "object"` guard, and the `Set.has(x) ? (x as T)` ones are guarded narrowings. The only unguarded casts worth noting are listed below.

---

## F-05 — String-to-enum narrowing duplicated in 18 places

- **Category:** Duplicated Logic / Weak Typing (mitigated by guards)
- **Risk:** 4/10 · **Priority:** P2 · **Scope:** repeated (18 `Set<string>` constants, ~17 cast sites)

**Files:** `lib/bookings/booking-filters.util.ts:6-7,21-23`, `lib/stylists/stylist-filters.util.ts:4,14`, `lib/branches/branch-filters.util.ts:5,13`, `lib/chairs/chair-filters.util.ts:6-7,16-17`, `lib/plans/plan-filters.util.ts`, `lib/plans/admin-subscription-filters.util.ts`, `lib/earnings/payout-filters.util.ts`, `lib/bookings/schedule-filters.util.ts:8-9,16-17`; and again in the matching toolbars: `components/stylists/stylist-toolbar.tsx:26`, `branch-toolbar.tsx:23,34`, `chair-toolbar.tsx:24-25,36,45`.

**What is wrong:** each domain builds `new Set<string>(Object.values(Enum))` and casts after `has()`. The same Set is built **twice** per domain (once in the filter util, once in the toolbar), and a few casts are unguarded: `components/commissions/commission-rule-form-dialog.tsx:111,127`, `floor-plan/inspector/chair-inspector.tsx:36`, `working-hours/special-days-section.tsx:67` use `event.target.value as Enum`.

**Impact:** correctness is fine today because the guarded ones are correct. The risk is drift: adding an enum member in one place and not the other, and the unguarded `<select>` casts silently accept any string if an option list changes.

**Correction:** one shared `parseEnumValue(enumObject, value)` helper (a type-guard returning `T | undefined`) in `lib/core/`, used by filter utils and toolbars; replace the unguarded `<select>` casts with it. No behavior change.

**Independent**; pairs naturally with F-09 (a lint rule could ban `as <Enum>` on form input later).

---

## F-06 — The bilingual `pair()` helper is copied five times

- **Category:** Duplicated Logic / Duplicated Data Models
- **Risk:** 4/10 · **Priority:** P2 · **Scope:** 7 locations

**Files:** identical-purpose `function pair(value): { en: string; ar: string }` in `components/jobs/job-posting-form-dialog.tsx:32`, `catalog-items/catalog-item-form-dialog.tsx:29`, `catalog-items/catalog-tag-form-dialog.tsx:19`, `payment-gateways/payment-gateway-form-dialog.tsx:28`, `currencies/currency-form-dialog.tsx:19`; near-duplicates `localeText` (`lib/platform/website-content.util.ts:2`) and `localizedText` (`lib/core/format/booking-format.util.ts:5`).

**What is wrong:** three of the copies take `unknown` and cast to `Record<string, unknown>`; two are typed. Each re-implements "read en/ar from a translatable field that the API sometimes returns as `[]`" (the comment in `website-content.util.ts:1` documents that quirk).

**Impact:** the `[]`-instead-of-object quirk is handled in the shared util but not necessarily in each copy; a fix must be applied in 7 places.

**Correction:** one `toLocalePair(value)` in `lib/core/format/` (reusing the `localeText` logic), imported by all dialogs. Ideally the Zod schema normalizes the field once so UI code never sees `[]`.

**Depends on:** easiest to do together with F-01 when each dialog is migrated.

---

## Inspected, no confirmed problems

- **Weak typing:** none found beyond the casts above.
- **Validation placement:** API responses are validated; forms built with RHF validate with Zod. The gap is the hand-rolled dialogs (F-01).
- **Type ownership:** domain-grouped under `types/<domain>`; no cross-feature type sharing problems seen in samples.
