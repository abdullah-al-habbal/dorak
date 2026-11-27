---
nodeid: backend.feature-index.part-4
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-3.md) · [Next](feature-index-part-5.md)

### JobPosting API
- `ListJobPostingsAction` [GET /api/v1/jobs] — list active job postings. No auth.
- `ShowJobPostingAction` [GET /api/v1/jobs/{job}] — single job detail. No auth.
- `ApplyForJobAction` [POST /api/v1/jobs/{job}/apply] — apply as barber. Auth:barber
- Routes: jobs.php

### Frontend Consumption
> ⚠️ **HISTORICAL:** the list below describes the pre-rebuild Flutter screens. The rebuilt apps (`client_app`, `business_app`, `stylist_app`) consume these endpoints through `packages/core` repositories; see `frontend/mobile/docs/index.md`for the current screens.
- Brand list/detail screens (Flutter client app) — connected to Brand API (GET /brands, GET /brands/{id})
- BarberAffiliation list/accept/reject screens (Flutter client app) — connected to BarberAffiliation API
- JobPosting list/detail/apply screens (Flutter client app) — connected to JobPosting API
- All three consume APIs via `ExploreRepositoryImpl` / `BrandRepositoryImpl` / dedicated BLoC or local patterns
- `ApiEndpoints.dart` (dorak_core) updated with all three module endpoints
- Translations added for all three features

### Strict Enums (Phase 4-7 of master plan)
- 9 Backed Enum files across 5 modules: ChairStatus, BookingStatus, ApplicationStatus, AffiliationStatus, AffiliableType, ChairShape, Locale, Universe, ActivationStatusEnum
- Model casts on ChairModel.status, BookingModel.booking_status, ApplicationModel.status, BarberAffiliationModel.status+affiliable_type, ClientModel.preferred_universe
- Validation `in:` → `Rule::enum` in UpdateChairRequest, GetMarketingPageRequest, UpdateApplicationStatusRequest, CreateAffiliationRequest
- 6 actions fixed: strict enum comparisons instead of string
- Factories/seeders use enum values
- 12StrictEnums/SKILL.md — pattern guide

### Brand CRUD API
- `CreateBrandAction` [POST /api/v1/brands] — create brand. Auth:client
- `UpdateBrandAction` [PUT /api/v1/brands/{brand}] — update brand. Auth:client
- Routes in brands.php under `auth:client` middleware group

### Activation API (Admin)
- The generic activate and deactivate routes described here were replaced by per-resource routes under `/api/v1/dashboard/admin/` (for example `PATCH /api/v1/dashboard/admin/barbers/{barber}/activate`). Auth: dashboard admin

### Chair API
- `ListChairsAction` [GET /api/v1/chairs] — list chairs. No auth.
- `ShowChairAction` [GET /api/v1/chairs/{chair}] — single chair detail. No auth.
- `UpdateChairAction` [PATCH /api/v1/chairs/{chair}] — update chair. Auth: branch manager or admin

### Currency API
- `ListCurrenciesAction` [GET /api/v1/currencies] — list currencies. No auth.
- `ListExchangeRatesAction` [GET /api/v1/exchange-rates] — list exchange rates. No auth, throttled.
- `ConvertCurrencyAction` [GET /api/v1/currency/convert] — convert amount. No auth, throttled.

### Test Backfill (PRD 13 Phase 1)
- Booking concurrency: 3 tests — different chairs same slot, same slot different chairs, race condition via direct insert
- BarberAffiliation multi-shop constraint: CreateAffiliationAction + test for conflict
- `ErrorCodeEnum::CONFLICT` (HTTP 409) added for conflict responses
