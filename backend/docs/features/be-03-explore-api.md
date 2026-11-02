---
nodeid: backend.features.be-03-explore-api
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

# BE-03 — Explore API

## Status: ✅ Complete
## Frontend Consumer: [Mobile feature index](../../../frontend/mobile/docs/feature-index.md)

## What Was Built
- `ExploreBranchesAction` — Haversine SQL radius search with `latitude`, `longitude`, `radius`, `universe` filters + recommendation ranking
- `ExploreBarbersAction` — Haversine radius search for freelancers + recommendation ranking
- `GetBranchDetailAction` — branch info + chairs_count + barbers + services
- `GetBarberDetailAction` — barber info + services
- New filters: `catalog_item_ids[]`, `available_now`, `price_range[min/max]`, `rating_min`, `face_shape_compatible`
- Composite ranking: `geo*geographic + vector_similarity*α + edge_boost*β + face_match*γ`

## API Endpoints
| Method | Endpoint | Auth | Action |
|--------|----------|------|--------|
| GET | `/api/v1/explore/branches` | — | `ExploreBranchesAction` |
| GET | `/api/v1/explore/branches/{branch}` | — | `GetBranchDetailAction` |
| GET | `/api/v1/explore/barbers` | — | `ExploreBarbersAction` |
| GET | `/api/v1/explore/barbers/{barber}` | — | `GetBarberDetailAction` |

## Response Schemas

### GET /api/v1/explore/branches → 200 (paginated)
```json
{
  "data": [
    {
      "id": "uuid",
      "name": { "en": "string", "ar": "string" },
      "email": "string",
      "status": "active|inactive",
      "latitude": 33.5138,
      "longitude": 36.2765,
      "brand_id": "uuid",
      "distance": 2.5,
      "compatibility_score": 0.85,
      "rank": 1,
      "created_at": "datetime"
    }
  ],
  "meta": {
    "pagination": {
      "total": 100,
      "per_page": 15,
      "current_page": 1,
      "last_page": 7
    }
  }
}
```

### GET /api/v1/explore/branches/{branch} → 200
```json
{
  "data": {
    "id": "uuid",
    "name": { "en": "string", "ar": "string" },
    "email": "string",
    "status": "active|inactive",
    "latitude": 33.5138,
    "longitude": 36.2765,
    "brand_id": "uuid",
    "chairs_count": 5,
    "barbers": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "is_freelancer": false,
        "status": "active|inactive",
        "latitude": null,
        "longitude": null,
        "distance": null,
        "compatibility_score": null,
        "rank": null,
        "created_at": "datetime"
      }
    ],
    "services": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "price_amount_minor": 500000,
        "currency_code": "SAR",
        "duration_minutes": 30,
        "is_at_home": false,
        "is_active": true,
        "created_at": "datetime"
      }
    ],
    "created_at": "datetime"
  }
}
```

### GET /api/v1/explore/barbers → 200 (paginated, same shape as branches but with `is_freelancer`)

### GET /api/v1/explore/barbers/{barber} → 200
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "is_freelancer": true,
    "status": "active|inactive",
    "latitude": 33.5138,
    "longitude": 36.2765,
    "distance": 1.2,
    "compatibility_score": 0.92,
    "rank": 1,
    "services": [ "..." ],
    "created_at": "datetime"
  }
}
```

## Query Parameters (explore list endpoints)
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `latitude` | float | required | User latitude |
| `longitude` | float | required | User longitude |
| `radius` | float | required | km, min 0 |
| `universe` | string | required | men/women (branches) |
| `page` | int | 1 | Pagination |
| `catalog_item_ids[]` | uuid[] | — | Filter by catalog items |
| `available_now` | bool | — | Excludes a barber or branch chair with a pending, confirmed, or in-progress booking overlapping the next 15 minutes |
| `price_range[min]` | float | — | Min service price |
| `price_range[max]` | float | — | Max service price |
| `rating_min` | float | — | Min average rating |
| `face_shape_compatible` | string | — | oval/round/square/heart/diamond/oblong/triangle |

## Tests: 8 contract tests extending explore assertions + 34 feature tests across 6 modules
