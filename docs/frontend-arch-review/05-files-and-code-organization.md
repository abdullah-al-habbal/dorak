# 05 — Files and Code Organization

**Inspected:** `src/` structure, file naming, the "one type/schema/hook per file" rule, folder density, separation of constants, enums and utilities.

## Overall verdict

Organization is consistent and documented (`src/README.md`), partly enforced by a density script. Naming is uniform (`*.type.ts`, `*.zod.ts`, `*.constant.ts`, `*.util.ts`, `use-*.ts`). There are no catch-all files (`helpers.ts`, `types.ts`) and no file above 300 lines outside `ui/` and dictionaries. The largest utility is `lib/hours/opening-hours.util.ts` (168 lines).

Counts: 136 `type` files, 102 `interface`, 95 `zod`, 58 `enum` (about 390 files, roughly 29% of `src/`).

---

## F-13 — Written rules drift from practice

- **Category:** Inconsistent Directory Conventions / mild Excessive Fragmentation
- **Risk:** 3/10 · **Priority:** P2 · **Scope:** repeated, mostly documentation

**Evidence:**
1. `src/README.md` says "one type per file", yet `src/types/platform/website-content.type.ts:1-9` holds 5 types.
2. The hook rule says "one hook per file", yet 9 files export more than one hook: `use-website-content.ts` (7), `use-catalog-admin.ts` (6), `use-commissions.ts` (4), `use-payment-gateways.ts` (4), and others.
3. Both cases are **more cohesive** than literal splitting: a CRUD bundle for one entity changes together.

**What is wrong:** the written rule is stricter than practice, so reviewers learn they may ignore it, which weakens the authority of the other rules. Applied literally, it would also produce hundreds of tiny files (the "cohesive, not merely short" concern).

**Correction (documentation only, no restructure):** reword to "one type/schema/hook per domain concept; a CRUD hook bundle for one entity may share a file", and do not mass-merge existing files. Keep the folder density rule (≤10 files) as is.

**Independent.**

---

## Inspected, no confirmed problems

- **Barrels:** no `index.ts` anywhere. (`locales/*/index.constant.ts` are explicit aggregation files, not public barrels.)
- **Domain grouping:** `hooks/`, `lib/`, `services/`, `schemas/` use the same domain names, so tracing a feature is easy. I saw no shared-vs-feature misplacement in the samples.
- **Naming:** consistent. The only naming-level duplication is the helper functions in F-06.
- **Oversized files:** none.
