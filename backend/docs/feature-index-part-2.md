---
nodeid: backend.feature-index.part-2
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index.md) · [Next](feature-index-part-3.md)

### Client
- `LoginAction` [POST /api/v1/client/login] — email/password → Sanctum `client-app` token + client profile
- `RegisterAction` [POST /api/v1/client/register] — name/email/password → token + client (201)
- `LogoutAction` [POST /api/v1/client/logout] — revoke `currentAccessToken()` (auth:client)
- `RefreshTokenAction` [POST /api/v1/client/refresh-token] — rotate token (auth:client)
- `UpdateUniversePreferenceAction` [PATCH /api/v1/client/preferences/universe] — persists `preferred_universe` (men/women) (auth:client)
- `ClientModel` — fillable: name, email, password, preferred_universe. Sanctum HasApiTokens, HasUuids, HasTranslations

### Explore
- `ExploreBranchesAction` [GET /api/v1/explore/branches] — Haversine SQL radius search with `latitude`, `longitude`, `radius`, `universe` (via brand) filters. Paginated.
- `ExploreBarbersAction` [GET /api/v1/explore/barbers] — Haversine radius search for `is_freelancer=true` barbers. Paginated.
- `BranchResource` — id, name, email, status, latitude, longitude, brand_id, distance?, created_at
- `BarberResource` — id, name, email, is_freelancer, status, latitude, longitude, distance?, created_at
- `BranchModel` — fillable: name, email, password, brand_id, latitude, longitude. `BranchModel::brand()` BelongsTo BrandModel
- `BarberModel` — fillable: name, email, password. `BarberModel::services()` morphMany
- `BrandModel` — fillable: owner_id, name, description, logo_url, base_currency_code. `universe` field
- Migration: branches.brand_id FK + latitude/longitude, barbers.latitude/longitude, brands.universe, clients.preferred_universe

### Models
- `ClientModel` — HasUuids, HasTranslations, HasFactory, Notifiable, Sanctum tokens. `bans()` morphMany
- `BarberModel` — `activationLogs()`, `bans()`, `services()`. Accessor: `is_enabled`
- `BranchModel` — `activationLogs()`, `brand()`, accessor `is_enabled`
- `BrandModel` — `owner()` (→ClientModel), `baseCurrency()`, `branches()`, `affiliations()`, `services()`, `preference()`
- `PreferenceModel` — polymorphic `preferenceable()` (MorphTo). Fields: preferred_language, allows_notifications, display_currency_code, theme_mode, price_display_mode
- `BanModel` — polymorphic `bannable()` (MorphTo). Scope: `active` (banned_at ≤ now AND expires_at null OR > now)

### Ban Enforcement (Task 08)
- Client, barber, and dashboard-barber login return 403 `ACCOUNT_BANNED` for active bans; client social login, registration for an already-banned email, and token refresh apply the same check.
- `EnsureNotBanned` rejects banned client/barber API sessions; the self-service ban check remains available so clients can inspect their ban status.
- Booking creation rejects banned clients and barbers before persistence. `BanObserver` revokes active clients' and barbers' Sanctum tokens when a ban is created.

### Floor Plan & Booking Engine
- `GetFloorPlanAction` [GET /api/v1/branches/{branch}/floor-plan] — returns chairs with barber, no auth
- `ChairResource` — id, label, status, layout_settings, barber (via BarberResource::make)
- `BranchModel.chairs()` — HasMany to ChairModel
- `CreateBookingAction` [POST /api/v1/bookings] — accepts CreateBookingRequest (FormRequest), builds CreateBookingCommand, double-booking check (409), at-home booking support, returns BookingResource (201)
- `ListUserBookingsAction` [GET /api/v1/bookings] — auth client's paginated bookings
- `BookingResource` — id, starts_at, booking_status, chair (ChairResource::make), barber (BarberResource::make), services (ServiceResource::collection), home_address
- `ServiceResource` — id, name, price
- `CreateBookingRequest` — extends BaseApiFormRequest, validates chair_id/barber_id/starts_at/service_ids. Mutually exclusive validation: chair_id XOR home_address. home_address.latitude/longitude with required_with/prohibited_with
- `CreateBookingCommand` — readonly value object with PascalCase properties (ChairId, BarberId, ClientId, TimeSlot, ServiceIds, AtHomeLocation). ChairId nullable
- `BookingModel` — fillable: client_id, chair_id, barber_id, starts_at, booking_status, home_address. HasUuids, HasFactory. home_address cast to array
- Routes: bookings.php (auth:client), floor-plan.php (no auth)

### CI / Code Quality
- `phpstan.neon` — level `max`, paths: modules/, bootstrap/. Larastan extension
- `.github/workflows/backend-ci.yml` — Pint formatting, PHPStan max, PHPUnit coverage, SonarQube scan (MySQL service)
- `sonar-project.properties` — backend sources, exclusions, coverage reports
- BaseApiAction: removed abstract __invoke() (signatures vary per action)

### Branch/Barber Detail
- `GetBranchDetailAction` [GET /api/v1/explore/branches/{branch}] — branch info + chairs_count + barbers (nested BarberResource) + services (nested ServiceResource)
- `GetBarberDetailAction` [GET /api/v1/explore/barbers/{barber}] — barber info + services (nested ServiceResource)
- Routes added to explore.php
