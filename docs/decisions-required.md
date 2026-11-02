---
nodeid: docs.decisions
parentnode: docs.graph
childnodes:
  - docs.adr_0001
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Open Product Decisions

Routes: [documentation graph](index.md).

> Only unresolved product decisions live here; resolved ones are removed once implemented. Standing architecture record: [ADR 0001: brand owner as client](adr/0001-brand-owner-as-client.md).

## Task 04: Restrict Service Catalog Mutations to Admins
- [ ] Decision required: whether branches may **propose** catalog items for admin approval. If yes, this becomes a separate endpoint and is out of scope here.

## Task 79: Add Client Barber Discovery and Direct Booking
- [ ] [NEEDSHIL] Freelancer-only barbers (no branch workplace) have no booking entry yet: the CTA is disabled with a hint. Needs a product decision on a dedicated at-home booking screen for freelancers, since `BranchDetailBloc` requires a branch.

## Task 80: Wire Unwired Client Features
- [ ] [NEEDSHIL] Preferences screen can clear hidden brands but cannot hide one: there is no brand-listing endpoint for clients to pick from. Needs a product/API decision on where a client hides a brand.
- [ ] [NEEDSHIL] History media: the client uploads with photo type `after`; a before/after/reference picker is a product choice.

## Task 81: Clean Up Client Auth Flows
- [ ] [NEEDSHIL] Social login: add provider buttons in `login_content.widget.dart` behind a config flag. **Decision required:** which providers and SDKs (Google/Apple) ship in v1.
