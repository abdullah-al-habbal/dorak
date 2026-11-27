---
nodeid: mobile.state-management.pagination
parentnode: mobile.state-management
childnodes:
  - mobile.state-management.pagination.part-2
  - mobile.state-management.pagination.part-3
  - mobile.state-management.pagination.part-4
  - mobile.state-management.pagination.part-5
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Pagination

Feature states in the client and business apps hold a `Paged<T>`.

The legacy `PagePaginationNotifier` / `ScrollPaginationNotifier` `ChangeNotifier`s
were deleted in Phase 4; they had no production consumers. Do not reintroduce a
`ChangeNotifier` pager, and **do not add a generic `PaginationBloc<T>`** — bloc
dispatches on event *type*, so generic events work badly, and every real feed
carries more than a list (filters, tab, query).

---

## 1. The backend contract

Envelope, from `modules/Core/Helpers/ApiResponseTrait.php::paginated`:

```json
{
  "data": [ ... ],
  "meta": { "pagination": {
    "total": 25, "count": 15, "per_page": 15,
    "current_page": 1, "total_pages": 2
  }}
}
```

Nine client-facing collections paginate today:

```
GET /explore/branches            <- the Discovery feed
GET /explore/barbers
GET /client/favorites
GET /client/history
GET /bookings
GET /branches/{branch}/reviews
GET /branches/{branch}/chairs
GET /service-catalog/items
GET /brands
```

`/explore/branches` requires `latitude`, `longitude`, `radius` and `universe`,
and accepts `per_page` (max 100), `catalog_item_ids[]`, `available_now`,
`price_range{min,max}`, `rating_min`, `face_shape_compatible`. Its `clientId` is
`$this->user()?->id` — nullable, so **the feed is guest-accessible**.

## Continued in

- [Part 2: 2. What core provides](pagination-part-2.md)
- [Part 3: 4. Paged<T>](pagination-part-3.md)
- [Part 4: Transitions — there is no public copyWith](pagination-part-4.md)
- [Part 5: 6. Rules](pagination-part-5.md)
