---
nodeid: docs.readiness.t12
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/
---

# T12. Dashboard web hygiene

Status: partly done (Firefox run blocked, see notes) · Phase 6 · Depends on: none

- [x] T12.1 Add `robots: { index: false, follow: false }` to the root layout metadata so login and register are not indexed.
- [ ] T12.2 Add a Firefox project to `playwright.config.ts` for the smoke specs and run it.
- [ ] T12.3 Record any Firefox-specific failures as backlog items instead of claiming compatibility.

Acceptance: private pages carry noindex; Firefox smoke results are documented.

## Implementation notes

- T12.1 done: `NOINDEX_ROBOTS` in `src/config/seo.constant.ts` is the root layout `robots` metadata (`index: false, follow: false`). Tests: `tests/lib/config/seo.constant.test.ts` (Vitest) and `tests/e2e/seo.spec.ts` (login and register pages carry `noindex, nofollow`).
- T12.2 prepared, not run: a `firefox` Playwright project runs only `auth`, `error-pages` and `seo` specs (a smoke pass, not a compatibility claim); `test:e2e:install` now installs Firefox as well. Firefox 157 is installed locally.
- **Blocker:** `next build` refuses to run on `next@16.4.4` (two moderate advisories, GHSA-mfr8-8qww-v76h and GHSA-vc7v-qv4w-wrv8, fixed in 16.4.6). Playwright builds the dashboard before it starts, so no e2e project can run until Next is bumped to a patched release. This also blocks the dashboard build gate in T13. T12.2 and T12.3 stay open until then.
