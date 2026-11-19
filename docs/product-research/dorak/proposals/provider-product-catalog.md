# Dorak proposal: optional product catalog on provider profiles

Status: Proposed, not implemented. Suggested repository location: `docs/product-research/dorak/proposals/provider-product-catalog.md`. This supersedes the after-visit product discovery proposal as the first release. After-visit recommendations may be considered later. Do not mark this capability as present in Dorak's current-state study or feature matrix.

## Problem, goal and boundary

Customers want to see what a specific location offers before visiting, including the current price, photos, and availability. Authorized staff need to maintain that information themselves. Enable a **Products** tab inside the existing provider profile, not a global retail marketplace. The catalog is opt-in and can be disabled independently of scheduling. It requires neither a booking nor an appointment-related recommendation.

The proposal should model a product-only shop without inventing a booking calendar. This is eligibility for an appropriate profile, not automatic onboarding of every shop. If Dorak's current provider profile cannot safely support a products-only business, pilot on existing providers first and document the smallest later change needed for independent shops.

## User experience

| Actor | Experience |
|---|---|
| Customer on a branch or store page | See a Products tab only if that profile is enabled and has a publicly visible listing. Browse product name, photo, description, category, typed details, local price and currency, and availability at that location. |
| Customer on a brand page | Optionally discover the brand's products. Select a location before seeing a location-specific price or exact quantity; do not silently substitute a different branch or sum stock across locations. If a brand page is only a directory or label, do not give it catalog ownership by default. |
| Authorized business operator | Create and edit product details, upload or reorder images, publish or unpublish a listing, assign the listing to a permitted location, and maintain its local price and quantity. If brand-level and branch-level staff coexist, define who controls shared content versus local offers. |

Operators see the exact recorded quantity for locations they manage. For customers, default to `In stock`, `Out of stock`, or `Availability not confirmed`, with an explicit option to show the exact count where that is a business requirement and the stock signal is sufficiently current. If exact stock is shown, label it as the last reported quantity, with a timestamp, not a guarantee or reservation. Treat an unknown count as unknown rather than zero, and turn stale information into an unconfirmed state under a documented freshness policy. Pilot defaults can show an out-of-stock public item with a clear label; draft or unpublished items must never be sent to the public client.

## Domain and implementation constraints

| Concept | Proposed ownership and invariant |
|---|---|
| **Catalog product** | The responsible business owns the product definition: localized name and description where supported, photos, category, and structured public metadata such as size in `ml` and product category. Do not assume that a brand is a tenant or that similar-named products are the same record. |
| **Location listing** | A product's publication, price and currency, and stock belong to the actual selling location. One active listing per product/location for the MVP unless variants explicitly require a different key. One brand product can be used at more than one branch without sharing a stock counter. |
| **Branch stock** | Start with manually maintained integer quantities, a last-confirmed time and an audit trail for modifications. Reject negative quantities; make an unknown value distinct from zero. Prevent lost updates and make a stock adjustment and its audit event consistent. Do not automatically decrement quantity when a user views an item or books a service. |
| **Price, media and metadata** | Store monetary amounts in integer minor units with an explicit currency and consistent unit handling; do not rely on floating point. Validate image type/size and access before publication. Keep stable searchable fields typed; allow schema-validated metadata, with explicit public fields. Do not allow arbitrary private metadata or HTML into public responses. |
| **Identity and authorization** | Reuse a suitable existing authentication path. A location's `catalog_enabled` capability governs applicability; policies govern who can view drafts, edit content, change stock, and publish for a given business/location. Enforce policies server-side for both reads and writes, and preserve inactive/suspended states. Only revisit a new authentication guard if the verified identity model or credential boundary actually requires it. |

Example: Brand X defines one 250 ml shampoo. Its branch A lists it at price A with six units, and branch B lists it at price B with zero units; updating either branch does not change the other. Independent Shop Y manages its own listing and stock under its own permissions. Neither authorization nor pricing should depend on the text name of a shop, brand, or product.

Consider a small catalog module, within the existing modular structure, separate from `Booking`. Reuse the existing media, translation, money, business-scope and API conventions where they fit; these are design hypotheses until verified in the repository. For the public read, scope by location and publication status, paginate, and avoid fetching a separate set of media for every row. Publication, stock, suspension and capability changes must invalidate any affected public cache. Do not add a new search engine, inventory service, or role system for this scope.

## MVP scope and acceptance criteria

- **P0:** Opt-in at the eligible location, self-managed catalog, published customer tab, local price and currency, stock editing and freshness, images, name, description and bounded metadata, server-side authorization, tests and a disable path. Start with the existing customer profile and a single existing business-management surface based on the repository map; do not build an additional app to ship the first pilot.
- **P1 after pilot:** Brand-level browsing or bulk assignment if multi-branch operators actually need it; test independent retailer onboarding if the current profile model can support it safely. Add support for variants and batch operations only to address demonstrated listing or management needs.
- **Out of scope:** Global shopping tab, seller marketplace onboarding at scale, carts, payments, orders, pickup or reservation workflow, shipping, product commissions, automated inventory sync, new login types, and appointment-driven recommendations. Catalog clicks are not purchases or demand for checkout.

| Given | When | Then |
|---|---|---|
| No published item, catalog disabled, or public profile suspended | A customer opens the page or requests its catalog directly | No products surface or private data leaks; unrelated booking features are unaffected by the catalog setting. |
| A product appears in two locations | The manager changes stock or price at location A | Location B's values and permissions remain unchanged. |
| Stock is zero, unknown, or older than the freshness policy | A customer views the listing | The public state differentiates them and never represents unknown/stale stock as currently guaranteed. |
| A staff member lacks membership or the relevant permission at the target location | They try to list drafts, edit quantity, upload against the listing, or publish | The backend rejects the operation regardless of UI controls; another business's nonpublic data is not disclosed. |
| A listing is unpublished or a profile is suspended | A client reopens the profile or follows a direct product link | Previously cached public data is invalidated and the listing is no longer public. |
| Two staff members edit the same stock value | One submits an outdated edit | The service rejects the stale write or otherwise resolves it without silently losing an adjustment. |
| A product-only location is supported and enabled | A customer opens its profile | Products can be shown with no fake booking slots or staff appointments. |

## Pilot and decision signals

Use two to four participating businesses, ideally one with more than one location. Treat product-only onboarding as a separate hypothesis if it requires a profile-model change. Run a limited evaluation with a small set of verified listings, then measure the share of participating businesses that publish and keep listings current, tab opens and product-detail views per eligible profile visitor, accuracy of spot-checked prices and availability, and any change in booking clicks or confirmations for booking-capable profiles. A clear decision rule is to expand only when operators reliably maintain their listings, customers use them, and booking is not crowded out. In the absence of checkout, do not claim attributed sales; gather direct feedback from shops and customers instead.

Toptalla advertises product listings with images, prices, categories, stock management and display on the booking site and marketplace ([Toptalla catalog](https://business.toptalla.com/en/features/catalog)). Its public page does not establish exact customer-facing stock by branch or store-only eligibility. Therefore this is a practical capability for Dorak, not a proven competitive differentiator. Test local price and availability accuracy, maintenance effort, and usefulness at a specific location rather than claiming exclusivity.

## Decisions (PC-0, recorded 2026-11-19)

Resolved by the owner after the read-only feasibility review:

1. **Ownership:** the product definition is brand-owned. Each branch has its own listing that carries price, currency, publication and stock.
2. **Opt-in:** `catalog_enabled` is a per-branch setting, not a brand-wide Pennant flag.
3. **Pilot scope:** existing salons and barbershops only. Product-only shops stay deferred until a venue-type or bookings-enabled field is designed.

## Next step: map the real code before approval to implement

Ask Claude Code to inspect, read-only, the existing brand/business/branch ownership model, product-like concepts, memberships and policies, public profile DTOs and surfaces, media handling, money and currency handling, and branch-scoped access. Request exact `path:line` evidence, the smallest safe implementation plan, proposed tests, and blockers for independent shops. In particular, ask whether a brand is already a business owner, an umbrella profile, or only a label. Do not modify migrations, routes, guards, the feature matrix or application code during that mapping.
