---
nodeid: docs.readiness.t02
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Marketing/
  - backend/modules/Website/
---

# T2. Backend legal pages and public SEO

Status: todo · Phase 2 · Depends on: none · Reuses: `Modules\Marketing`, `Modules\Website`

- [ ] T2.1 Migration: nullable `published_at` on `marketing_pages`.
- [ ] T2.2 Seed slugs `privacy`, `terms`, `about`, `contact`, `delete-account` (EN and AR placeholder text) in `Marketing/Config/seed_pages.php`.
- [ ] T2.3 `GET /marketing/pages/{slug}` returns 404 for unpublished pages.
- [ ] T2.4 Blade routes `/{locale}/privacy` and the other slugs in `Website/Routes/Web/website_routes.php`.
- [ ] T2.5 Footer links; `delete-account` page explains the process and links to support.
- [ ] T2.6 SEO on the public layout: canonical, hreflang (EN/AR), `og:*`, `/sitemap.xml` (published pages only), sitemap line in `public/robots.txt`.

Tests (Pest): draft vs published, locale fallback, sitemap contents, API contract.
Acceptance: five public URLs per locale; unpublished pages never exposed; gates pass.
