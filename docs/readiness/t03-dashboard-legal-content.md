---
nodeid: docs.readiness.t03
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
  - backend/modules/Marketing/Http/
---

# T3. Dashboard legal content management

Status: done · Phase 2 · Depends on: T2 · Reuses: the website-content screen (FT-13)

- [x] T3.1 Publish toggle and published-state column on the website-content screen.
- [x] T3.2 Admin request and resource carry `published_at`; proxy allow-list updated.
- [x] T3.3 EN and AR completeness hint per page.
- [x] T3.4 Change tracking: record publish and unpublish through `Modules\Audit`.

Tests: Pest admin update (401, 403, 422, 200); Vitest for the screen.
Acceptance: an admin can edit, translate, publish and unpublish each legal page.

## Implementation notes

- Backend: `PATCH /dashboard/admin/marketing-pages/{page}/published`, `MarketingPagePublisher` (completeness check, audit log `marketing_page`), `published_at` on the admin resource. Tests in `DashboardAdminWebsiteContentTest` (401, 403, 404, 422, no-op, log).
- Dashboard: a Published or Draft badge and a switch on each page card (`ContentPagesPanel`), a hint naming the missing language, proxy allow-list entry, EN and AR strings. Tests: `content-pages-panel.test.tsx` and `missingLocales` in `website-content.util.test.ts`.
- The existing section editor still edits the body as JSON (FT-13); legal text uses `{heading, paragraphs[]}`. A friendlier editor stays a backlog item.
- Gates run for this task: backend Pest (targeted) and Pint; dashboard lint, typecheck and the full Vitest run. Build, Playwright and the web-design-guidelines review are run once in T13.
