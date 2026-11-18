---
nodeid: docs.readiness.t12
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/
---

# T12. Dashboard web hygiene

Status: done · Phase 6 · Depends on: none

- [x] T12.1 Add `robots: { index: false, follow: false }` to the root layout metadata so login and register are not indexed.
- [x] T12.2 Add a Firefox project to `playwright.config.ts` for the smoke specs and run it.
- [x] T12.3 Record any Firefox-specific failures as backlog items instead of claiming compatibility.

Acceptance: private pages carry noindex; Firefox smoke results are documented.

## Implementation notes

- T12.1 done: `NOINDEX_ROBOTS` in `src/config/seo.constant.ts` is the root layout `robots` metadata (`index: false, follow: false`). Tests: `tests/lib/config/seo.constant.test.ts` (Vitest) and `tests/e2e/seo.spec.ts` (login and register pages carry `noindex, nofollow`).
- T12.2 done: a `firefox` Playwright project runs only the `auth`, `error-pages` and `seo` specs (a smoke pass, not a compatibility claim); `test:e2e:install` installs Firefox too. Result with Firefox 157: 7 of 7 passed, the same 7 also pass in Chromium (`DB_DATABASE=dorak_test E2E_APP_PORT=3100 E2E_BACKEND_PORT=8100 TZ=UTC npx playwright test --project=firefox --project=desktop tests/e2e/seo.spec.ts tests/e2e/auth.spec.ts tests/e2e/error-pages.spec.ts`; ports 3000 and 8000 were held by other processes on the machine, so the documented port overrides were used).
- T12.3: no Firefox-specific failure was found, so no backlog item was added. Only these three specs were run in Firefox; the other screens are not claimed.
- The production build first refused to run on `next@16.4.4` (two moderate cache advisories); `next` and `eslint-config-next` were bumped to 16.4.6 in `a0c207e5d` with the owner's approval.
