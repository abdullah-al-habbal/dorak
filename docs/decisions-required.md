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

Source: [product audit](planning/product-audit-part-3.md). Launch-readiness items (G5 SMS driver, G8 staff password routes) need engineering, not a product call.

## Audit G2: Brand Verification
- [x] Decided: admins approve brands (status gate pending → active). Remove this entry once implemented.

## Audit G4: Earnings and Plan Visibility
- [x] Decided: the owner sees full plans and earnings, the manager sees branch earnings, the stylist sees personal earnings. Remove this entry once implemented.

## Audit G6: Owner-Set Barber Pricing
- [x] Decided: owners may override a barber's price and duration. Remove this entry once implemented.

## Audit G10 / G11: Business and Stylist App Scope
- [ ] [NEEDSHIL] business_app lacks services, hours, staff list, disputes and inbox; stylist_app lacks past appointments, services, inbox and earnings. **Decision required:** which of these ship in the MVP?
