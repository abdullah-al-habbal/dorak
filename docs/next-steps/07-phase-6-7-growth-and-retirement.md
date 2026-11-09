---
nodeid: docs.next_steps.phase_6_7
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/
  - backend/modules/Core/Providers/Filament/
  - frontend/web/dashboard/src/
---

# Phases 6 and 7: Growth, then Retire Filament

Routes: [index](index.md) · [decisions](01-decisions.md).

## NS-25: Website content

- **Guards:** admin.
- **Story:** the platform team edits the marketing pages, their sections, the testimonials and the onboarding screens without a deploy.
- **Decision:** [D13](01-decisions.md#d13-the-laravel-public-website), resolved: the public website stays in Laravel, so this edits the content its Blade pages read.
- **Backend: New.** `marketing_pages`, `sections`, `testimonials` and `onboarding_configurations` have public read APIs and seeders, but no write API.
- **Dashboard:**
  - a "Content" area with a page list, ordered sections, testimonials and the onboarding steps;
  - bilingual fields;
  - a preview.
- **Done when:** Pest covers the write rules, and E2E covers editing a section and seeing it in the public API.

## NS-26: Plan self-service and billing

- **Guards:** owner, admin.
- **Story:** an owner upgrades or renews their plan and pays online.
- **Status: deferred after launch** ([D6](01-decisions.md#d6-plan-billing-at-launch): billing is manual at launch).
- **Backend: New.** The subscription and gateway tables exist (`brand_subscriptions`, `payment_gateways`), but no checkout, invoice or webhook flow does.
- **Dashboard:** plan comparison, checkout and invoices on the owner's Subscription page.

## NS-27: Barber web extras

- **Guards:** barber.
- **Status: closed, no work** ([D7](01-decisions.md#d7-barber-web-scope-after-filament): the barber web stays light). Kept for the record, in case the scope widens later:
  - services and prices;
  - portfolio photos (`barber_portfolio_photos`);
  - invitations;
  - job applications.

  Each needs a dashboard route for barbers. Today they exist only for the stylist app.

## NS-28: Retire Filament

- **Guards:** none directly. This is clean-up.
- **Start when:** every row in the [coverage matrix](08-coverage-matrix.md) Filament map has its replacement shipped, including NS-30 (barber approvals, today possible only through Filament or `admin_api`) and NS-29. NS-25 to NS-27 are not needed, because Filament never covered them.
- **Scope:**
  - remove `Core/Providers/Filament/{Admin,Branch,Barber}PanelProvider.php`;
  - remove every `modules/*/Filament/` folder and the panel routes;
  - remove `admin_api` routes the dashboard has replaced (activation, audit, brand features) once no client uses them, after checking the mobile apps;
  - remove code paths that exist only for Filament: for example, the Filament approve button shares `BrandPolicy::approve`, and the categories table shares `CatalogCategoryUsage`. Keep the shared rules.
  - Removing the Composer package changes dependencies, so ask before running `composer remove`.
- **Docs:** update the docs that still name Filament, for example [feature modules plan](../feature-modules-plan.md) (Admin Brands and Admin Catalog records) and [open decisions](../decisions-required.md).
- **Done when:**
  - Pest is green, with no route left under `/admin`, `/branch` or `/barber` that served a panel.
  - PHPStan and Pint pass.
  - The full Playwright suite passes.
