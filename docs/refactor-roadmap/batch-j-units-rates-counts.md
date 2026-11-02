# Batch J (part 1): Units, rates and counts

Status: [x] Done. Part 2 (booleans `allows_*`, `favorited_*`, `duration_minutes`, `rating_average`) is pending.

## Renames (schema in place, all layers)
- `barbers.travel_radius` to `travel_radius_km`; `client_discovery_preferences.default_radius` to `default_radius_km`. Unit is kilometres, derived from `AtHomeBookingRules::distanceKm` and the explore haversine (6371 km). The explore request `radius` parameter is not a column and is unchanged.
- `barber_affiliations.commission_rate` to `commission_percent` (validated 0-100).
- `client_face_analysis_results.confidence_score` to `confidence_ratio` (clamped 0-1 by the parser).
- `recommendation_edges.weight` to `weight_ratio` (backend only).
- `dashboard_email_changes.attempts` to `attempts_count`.

## Consumers
Backend models, requests, resources, resolvers, factories, Filament and Lang keys; dashboard mappers, Zod schemas, forms, i18n keys and tests; mobile DTO fields (`travelRadiusKm`, `defaultRadiusKm`, `commissionPercent`, `confidenceRatio`), regenerated `*.g.dart` and fixtures. The dashboard endpoint key for the `/travel-radius` URL is unchanged.

## Verification
`migrate:fresh --seed`, Pint, backend 1331 tests; dashboard lint, 508 tests, build; mobile `melos verify`.
