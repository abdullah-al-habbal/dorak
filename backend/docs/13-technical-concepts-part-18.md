---
codeanchors:
  - backend/modules/
---

Part 18 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-17.md) · [Next](13-technical-concepts-part-19.md)

## PART 3: LARAVEL/FLUTTER INTEGRATION PATTERNS

### Pattern 01: API Response Format

All API responses use one envelope, defined in [the response standard](api-response-standard.md).

### Pattern 02: Auth Flow

**Client App (Sanctum tokens):**
1. Login → `POST /api/v1/client/login` → returns `data.token`
2. Store token in `FlutterSecureStorage`
3. Attach `Authorization: Bearer {token}` to all requests via Dio interceptor
4. On 401 → clear token → redirect to login

**Barber App (Sanctum tokens):**
1. Login → `POST /api/v1/barber/login` → returns `data.token`
2. Same flow as client app

**Business App (Sanctum tokens via `branch_api` guard):**
1. Login → `POST /api/v1/branch/login` → returns `data.token`
2. Same flow as client app

**Dashboard (Next.js session):**
1. Login → `POST /api/v1/dashboard/login`, the dashboard stores the session in httpOnly cookies
2. The proxy attaches the access token to API calls
