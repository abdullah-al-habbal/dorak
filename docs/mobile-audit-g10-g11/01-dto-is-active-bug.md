---
nodeid: docs.mobile_audit_g10_g11.dto_is_active
parentnode: docs.mobile_audit_g10_g11
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
---

# 01: `BarberServiceDto` `active` vs `is_active`

Routes: [index](index.md).

**Status:** Fixed in Task 1 (Gap G10/G11).

## Problem
The backend serializes a barber service with `is_active` (`backend/modules/OfferedService/Http/Resources/Shared/ServiceResource.php`) and validates `is_active` on writes (`Http/Requests/Barber/BarberServiceRequest.php`). Mobile core used `active` in both directions:

- `BarberServiceDto` parsed `json['active'] ?? true`, so every service appeared active.
- `DioStylistOperationsRepository._servicePayload` sent `'active'`, which the backend does not validate, so deactivation was silently dropped.

## Impact
No screen edits services yet, so no user-visible failure occurred. `stylist_app` does filter its read-only services list by `service.active`, so inactive services were still shown. Any services editor would have been broken from day one.

## Fix
- `barber_service.dto.dart`: `@JsonKey(name: 'is_active', defaultValue: true)` on the `active` field. The Dart field name is unchanged, so no app code needed to change.
- `operations.repository.dart`: `_servicePayload` sends `is_active`.
- Regenerated `barber_service.dto.g.dart`.
- Regression test: `packages/core/test/barber_service_active_contract_test.dart` covers parsing `is_active` true and false, the default when absent, the legacy `active` key being ignored, and the `is_active` payload on create and update.

## Wire contract
`GET/POST/PUT /barber/services...` use `is_active` (boolean) in requests and responses.
