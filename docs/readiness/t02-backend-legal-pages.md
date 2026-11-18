---
nodeid: docs.readiness.t02
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Marketing/
  - backend/modules/Website/
---

# T2. Backend legal pages and public SEO

Status: done · Phase 2 · Depends on: none · Reuses: `Modules\Marketing`, `Modules\Website`

- [x] T2.1 Migration: nullable `published_at` on `marketing_pages`.
- [x] T2.2 Seed slugs `privacy`, `terms`, `about`, `contact`, `delete-account` (EN and AR placeholder text) in `Marketing/Config/seed_pages.php`.
- [x] T2.3 `GET /marketing/pages/{slug}` returns 404 for unpublished pages.
- [x] T2.4 Blade routes `/{locale}/privacy` and the other slugs in `Website/Routes/Web/website_routes.php`.
- [x] T2.5 Footer links; `delete-account` page explains the process and links to support.
- [x] T2.6 SEO on the public layout: canonical, hreflang (EN/AR), `og:*`, `/sitemap.xml` (published pages only), sitemap line in `public/robots.txt`.

Tests (Pest): draft vs published, locale fallback, sitemap contents, API contract.
Acceptance: five public URLs per locale; unpublished pages never exposed; gates pass.

## Implementation notes

- Legal pages are seeded as **drafts**; nothing is public until an admin publishes a page (T3 adds the toggle). Re-run the seeders on an existing database to add them (`insertOrIgnore`).
- Legal text is placeholder wording in EN and AR (`Marketing/Config/seed_legal_sections.php`) pending the owner's approved text.
- The footer already linked `/{locale}/features` and `/{locale}/pricing`, which did not exist; the `/{locale}` routes fix that.
- `public/robots.txt` was replaced by the `/robots.txt` route so the sitemap line uses the configured domain.
- Tests: `tests/Feature/Website/PublicPagesTest.php` (10 tests); Marketing, Architecture, Contract, route-coverage and seeder suites pass.
