---
nodeid: backend.12-implementation-prd.part-2
parentnode: backend.12-implementation-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [12 — Implementation PRD: From Current State to MVP](12-implementation-prd.md) · [Previous](12-implementation-prd.md) · [Next](12-implementation-prd-part-3.md)

## 2. Track A: Admin Panel Gaps

All admin resources were delivered in the dashboard (NS-04 to NS-30). The following **pages** were missing:

| Module | Missing Page | Status |
|--------|-------------|--------|
| Booking | `CreateBookingPage` | ✅ Created |
| Review | `CreateReviewPage`, `EditReviewPage` | ✅ Created |
| Activation | `EditActivationLogPage` | ✅ Created |
| JobPosting.Application | `CreateApplicationPage` | ✅ Created |

**Total Track A gap:** 5 pages — all resolved ✅

Acceptance criteria:
- [x] Each missing page follows the existing 8-file standard CRUD template
- [x] Pages integrate with existing module policies/gates
- [x] `dart analyze` clean (frontend unaffected — admin-only)

---

## 3. Track B: Client API Gaps

REST API endpoints are missing for modules that the mobile app needs to consume.

### 3.1 High Priority (required for Phase 1 completion)

| Module | Endpoints Needed | Why | KANBAN ref | Status |
|--------|-----------------|-----|------------|--------|
| **Brand** | `GET /brands`, `GET /brands/{id}`, `POST /brands`, `PUT /brands/{id}` | Mobile brand management (list, detail, create, update) | TN-01 | List/show ✅ (GET); create/update missing |
| **Chair** | `GET /branches/{branchId}/chairs`, `GET /chairs/{id}` | Floor-plan chair data beyond the basic floor-plan endpoint | CH-01 | ❌ |
| **BarberAffiliation** | `POST /barbers/{id}/affiliate`, `POST /affiliations/{id}/accept`, `POST /affiliations/{id}/reject`, `GET /barbers/{id}/affiliations` | Invite/accept/reject flow | AF-01 | ✅ All 4 built |
| **Barber Activation** | `POST /barbers/{id}/activate`, `POST /barbers/{id}/deactivate` | Control which universe a barber appears in | (implied by Activation module) | ❌ |

### 3.2 Medium Priority (Phase 2 features)

| Module | Endpoints Needed | Why | KANBAN ref | Status |
|--------|-----------------|-----|------------|--------|
| **JobPosting** | `GET /jobs`, `GET /jobs/{id}`, `POST /jobs/{id}/apply` | B2B job board — list, detail, apply | (implied by Phase 2) | ✅ All 3 built |
| **Application** | `GET /applications`, `PUT /applications/{id}/status` | Branch manager reviews applications | (implied) |
| **Currency** | `GET /currencies`, `GET /exchange-rates`, `GET /convert?from=X&to=Y&amount=Z` | Mobile price display | CU-01 |

### 3.3 Lower Priority (Phase 3)

| Module | Endpoints Needed | Why |
|--------|-----------------|-----|
| **OfferedService** | Admin manages via the dashboard; may need `GET /barbers/{id}/services` for mobile | Currently embedded in explore/booking flows |
| **Ban** | Read-only check `GET /clients/{id}/bans/check` | Prevent banned clients from booking |
| **Social Login** | `POST /auth/social/{provider}` | Socialite → Sanctum token flow |
