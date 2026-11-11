---
nodeid: backend.13-technical-concepts.part-18
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 18 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-17.md) · [Next](13-technical-concepts-part-19.md)

## PART 3: LARAVEL/FLUTTER INTEGRATION PATTERNS

### Pattern 01: API Response Format

All Dorak API responses follow `ApiResponseBodyValueObject`:

```json
// Success (paginated)
{
  "status": "success",
  "code": "FETCHED",
  "data": { "items": [...], "meta": { "current_page": 1, "last_page": 5 } }
}

// Success (single)
{
  "status": "success",
  "code": "FETCHED",
  "data": { "id": "...", "name": "..." }
}

// Error
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "The name field is required."
}
```

### Pattern 02: Auth Flow

**Client App (Sanctum tokens):**
1. Login → `POST /api/v1/client/login` → returns `plainTextToken`
2. Store token in `FlutterSecureStorage`
3. Attach `Authorization: Bearer {token}` to all requests via Dio interceptor
4. On 401 → clear token → redirect to login

**Barber App (Sanctum tokens):**
1. Login → `POST /api/v1/barber/login` → returns `plainTextToken`
2. Same flow as client app

**Business App (Sanctum tokens via `branch_api` guard):**
1. Login → `POST /api/v1/branch/login` → returns `plainTextToken`
2. Same flow as client app

**Dashboard (Next.js session):**
1. Login → `POST /api/v1/dashboard/login`, the dashboard stores the session in httpOnly cookies
2. The proxy attaches the access token to API calls
