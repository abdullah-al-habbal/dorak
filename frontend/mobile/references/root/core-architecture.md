---
nodeid: mobile.references.root.core-architecture
parentnode: mobile.guide
childnodes:
  - mobile.references.root.core-architecture.part-2
  - mobile.references.root.core-architecture.part-3
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 6. Core architecture

### Networking — `packages/core/lib/src/network/`

`ApiClient` wraps Dio. Verbs: `get`, `post`, `put`, `patch`, `delete`,
`getPaginated`. Interceptor order: `Locale → [Auth] → [Logging] → Retry`.
Connect timeout 15 s, receive 30 s. `POST` is never retried.

Base URL comes from `.env` via `ConfigProvider` — never hardcode it:

```
API_BASE_URL=https://dev-dorak-backend.io/api
API_BASE_URL_V1=https://dev-dorak-backend.io/api/v1
```

`.env` is gitignored; `.env.example` is committed.

**Response envelope** (every enveloped endpoint):

```json
{"success": bool, "statusCode": int, "code": "SUCCESS", "message": "...",
 "timestamp": "...", "data": ..., "meta": {...}, "errors": {...}}
```

`ApiClient` unwraps `data` and throws on failure. `data`/`meta`/`errors` keys
are **omitted entirely** when empty, not present-as-null.

**Exceptions** — a raw `DioException` never escapes `ApiClient`:

| Type | When |
|---|---|
| `ValidationException` | 422 `VALIDATION_FAILED`; `errors` is `Map<String, List<String>>` |
| `NetworkException` | transport failure; `statusCode` 0, `retryable` flag |
| `ApiException` | everything else; `isUnauthorized`/`isForbidden`/`isNotFound`/… |

### Storage — `packages/core/lib/src/storage/`

| Contract | Impl | Holds |
|---|---|---|
| `TokenStorage` | `SecureTokenStorage` (flutter_secure_storage) | Sanctum bearer token |
| `AppPreferences` | `SharedAppPreferences` (shared_preferences) | `dontShowOnboarding` |

Both are abstract so tests never touch a platform channel.
`AppPreferences.dontShowOnboarding` is a **synchronous** getter — the launch
gate branches on it without an await. Construct with
`await SharedAppPreferences.create()` once during bootstrap; apps must not
declare `shared_preferences` themselves.

## Continued in

- [Part 2: Session — packages/core/lib/src/session/](core-architecture-part-2.md)
- [Part 3: Navigation — apps/client_app/lib/src/core/navigation/](core-architecture-part-3.md)
