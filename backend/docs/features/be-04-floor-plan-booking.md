---
nodeid: backend.features.be-04-floor-plan-booking
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

# BE-04 — Floor Plan & Booking Engine

## Status: ✅ Complete
## Frontend Consumer: FloorPlanScreen, BookingScreen, BranchShowPage

## What Was Built
- `GetFloorPlanAction` — returns chairs with barber info
- `CreateBookingAction` — double-booking check (409), at-home booking support
- `ListUserBookingsAction` — auth client's paginated bookings
- `ShowBookingAction` — single booking detail
- `CancelBookingAction` — cancel confirmed booking
- `BookingCompletedObserver` — auto-creates history record on completion

## API Endpoints
| Method | Endpoint | Auth | Action |
|--------|----------|------|--------|
| GET | `/api/v1/branches/{branch}/floor-plan` | — | `GetFloorPlanAction` |
| POST | `/api/v1/bookings` | auth:client | `CreateBookingAction` |
| GET | `/api/v1/bookings` | auth:client | `ListUserBookingsAction` |
| GET | `/api/v1/bookings/{booking}` | auth:client | `ShowBookingAction` |
| POST | `/api/v1/client/bookings/{booking}/cancel` | auth:client | `CancelBookingAction` |

## Response Schemas

### GET /api/v1/branches/{branch}/floor-plan → 200
Query parameters: `starts_at` (required ISO-8601 UTC timestamp, such as
`2026-07-25T14:00:00Z`) and `duration` (minutes). Booking create, walk-in,
reschedule, and rebook `starts_at` values use the same UTC timestamp contract.
Floor-plan and booking checks share half-open interval overlap semantics and
consider pending, confirmed, and in-progress bookings as blocking.

```json
{
  "data": {
    "chairs": [
      {
        "id": "uuid",
        "label": "Chair 1",
        "status": "available|occupied|maintenance",
        "layout_settings": {
          "position_x": 100,
          "position_y": 200,
          "width": 60,
          "height": 60,
          "rotation": 0,
          "shape": "square|circle"
        },
        "barber": {
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
      }
    ]
  }
}
```

### POST /api/v1/bookings → 201
```json
{
  "data": {
    "id": "uuid",
    "starts_at": "2026-07-25T14:00:00Z",
    "booking_status": "pending",
    "chair": { "id": "uuid", "label": "Chair 1", "status": "occupied", "layout_settings": {}, "barber": null },
    "barber": { "..." },
    "services": [
      { "id": "uuid", "name": "Fade Haircut", "description": "...", "price_amount_minor": 500000, "currency_code": "SAR", "duration_minutes": 30, "is_at_home": false, "is_active": true, "created_at": "datetime" }
    ],
    "home_address": null,
    "created_at": "datetime"
  }
}
```

### POST /api/v1/client/bookings/{booking}/cancel → 200
```json
{
  "data": {
    "id": "uuid",
    "booking_status": "cancelled",
    "..."
  }
}
```

### Error: Double booking → 409
```json
{
  "success": false,
  "statusCode": 409,
  "code": "CONFLICT",
  "message": "This seat was just taken."
}
```

## Tests: 3 concurrency tests + 5 booking contract tests
