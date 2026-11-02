---
nodeid: docs.decisions
parentnode: docs.graph
childnodes:
  - docs.adr_0001
  - docs.adr_0002
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Open Product Decisions

Routes: [documentation graph](index.md).

> Only unresolved product decisions live here; resolved ones are removed once implemented. Standing records: [ADR 0001: brand owner as client](adr/0001-brand-owner-as-client.md), [ADR 0002: MVP scope deferrals](adr/0002-mvp-scope-deferrals.md).

Source: [product audit](planning/product-audit-part-3.md). Launch-readiness items (G5 SMS driver, G7 branch gating, G8 staff password routes, G9 social-link check) need engineering, not a product call.

## Audit G1: Stylist History Media
- [ ] [NEEDSHIL] Only clients can upload and tag history photos. **Decision required:** may stylists upload before/after/reference photos too, or is it client-only?

## Audit G2: Brand Verification
- [ ] [NEEDSHIL] Brands have no status, so any verified client becomes an owner at once. **Decision required:** does an admin approve brands before they operate?

## Audit G3: Review Disputes
- [ ] [NEEDSHIL] Branch and barber dispute routes exist but no UI raises a dispute, so the admin queue stays empty. **Decision required:** who raises disputes (manager, stylist, both) and from which app?

## Audit G4: Earnings and Plan Visibility
- [ ] [NEEDSHIL] Owners, managers and stylists cannot see plan limits, earnings or payouts. **Decision required:** which roles see what, and in which app?

## Audit G6: Owner-Set Barber Pricing
- [ ] [NEEDSHIL] Owners can only price brand-level services, not a barber's. **Decision required:** may owners override a barber's price or duration?

## Audit G10 / G11: Business and Stylist App Scope
- [ ] [NEEDSHIL] business_app lacks services, hours, staff list, disputes and inbox; stylist_app lacks past appointments, services, inbox and earnings. **Decision required:** which of these ship in the MVP?
