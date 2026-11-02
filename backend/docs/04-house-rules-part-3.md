---
nodeid: backend.04-house-rules.part-3
parentnode: backend.04-house-rules
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [04 — House Rules (The Business Laws)](04-house-rules.md) · [Previous](04-house-rules-part-2.md)

## J. Language & universes

- **J1.** If any name or description is shown, then it should appear in the **user's language (Arabic or English)**.
- **J2.** If a translation is **missing**, then the system shows the **other language as fallback** — never an empty label.
- **J3.** If a client opens the app for the first time, then they choose a **universe**: Men's Grooming or Women's Beauty.
- **J4.** If a client is in a chosen universe, then discovery **defaults to matching shops** for that universe.
- **J5.** If a shop is **unisex**, then it appears in **both** universes.
- **J6.** A unisex Branch uses one floor plan with explicit men's and women's zones.

## L. Booking, reviews, and identity

- **L1.** At-home booking requires GPS latitude/longitude plus street, building, and unit/apartment text.
- **L2.** An MVP booking slot is derived from the total selected-service duration; cancellation is allowed only until two hours before its appointment.
- **L3.** Chair availability is scheduled-booking-only in the MVP; real-time occupancy is out of scope.
- **L4.** Reviews are allowed only after `Completed`. Flagged disputes keep a review unpublished for a 48-hour admin review.
- **L5.** A manager may create a Barber using name and phone without an app account. One phone may belong to both Client and Barber profiles.

---

## K. Value Objects (the No-Raw-JSON law)

> Enforced by `11-backend-architecture.md` §5 and implemented in `{Module}/ValuesObjects/`.

- **VO-1.** If a database column stores structured data, then its PHP representation **must** be a `final readonly` Value Object in `{Module}/ValuesObjects/`. Never an untyped `array`.
- **VO-2.** If a Value Object is cast from JSON, then the cast class **must** validate all keys and throw `InvalidArgumentException` on malformed data. No silent defaults.
- **VO-3.** If a Value Object contains enums, then the enum **must** be a Backed Enum and validated via `::tryFrom()` during hydration.
- **VO-4.** If a model has a nullable Value Object field, then the cast **must** return `null` for `null` database values — never a default/empty Value Object.
- **VO-5.** Cross-module Value Object sharing is **prohibited**. If `ClientInteraction` needs a `PriceRangeValueObject`, it defines its own or uses a primitive. No `use Modules\ServiceCatalog\...` in `ClientInteraction` Value Objects.

---

## L. Client Intelligence (the Catalog & Personalization law)

> Rules migrated from `prd.md` §8. See also `02-prd.md` §12 and `06-entity-model-abstract.md` §6.

- **CAT-1.** If a `ServiceCatalogItemModel` exists, then `OfferedServiceModel` **may** reference it via `catalog_item_id`, but is **not required** to. Free-text services remain valid.
- **CAT-2.** If a `ServiceCatalogItemModel` is deactivated (`is_active = false`), then existing `OfferedServiceModel` references remain valid, but new references are blocked.
- **HIST-1.** If a booking status transitions to `completed`, then a `ClientServiceHistoryModel` record **must** be auto-generated inside the same database transaction.
- **HIST-2.** If a client deletes their account, then `ClientServiceHistoryModel` records are **anonymized** (`client_id` set to `null`) but retained for aggregate recommendation integrity.
- **HIST-3.** A barber has **full read access** to a client's `ClientServiceHistoryModel` when that client has an active or upcoming booking with them. Access is read-only and scoped to the booking context.
- **FACE-1.** If a client uploads a face photo, the photo is **never** publicly visible. It is used solely for AI analysis and private recommendations.
- **FACE-2.** A client may upload **minimum 0, maximum 5** face photos. One may be designated `is_primary`.
- **FACE-3.** If a client deletes their account, face photos are purged after a **30-day grace period**.
- **INT-1.** If a client interacts with a discoverable entity, the `ClientInteractionLogModel` **must** capture the active universe and applied filters in the `context` JSON.
- **FAV-1.** `ClientFavoriteModel` records are **strictly private**. No user can see another user's favorites, and no public "favorite count" is displayed.
- **REC-1.** If a `RecommendationEdgeModel` weight is computed, it **must** include a `computed_at` timestamp and a `vector_version` so stale edges can be invalidated by future recomputation jobs.
- **REC-2.** Recommendation vector and edge recomputation runs as a **nightly batch job**, not real-time on every search query.
