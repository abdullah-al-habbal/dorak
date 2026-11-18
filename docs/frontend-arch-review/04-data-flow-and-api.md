# 04 — Data Flow and API

**Inspected:** `services/api/core/client.ts` (fully), the shared hook layer (`use-save-mutation`, `use-feedback-mutation`, …), the query-key and invalidation pattern, separation of network code from components.

## Overall verdict

Separation is excellent: 0 `fetch` calls in `components/` or `hooks/`, 0 direct `useQuery/useMutation/useQueryClient` in components, the browser only talks to `/api/dashboard/*` and `/api/auth/*`, and every response goes through a `safeParse` (`client.ts:67-70`). Token refresh (`refreshOnce`) is single-flight and 401 handling is correct, including one retry.

---

## F-08 — Zod validation failures on API responses are swallowed

- **Category:** Poor / Inconsistent Error Handling
- **Risk:** 4/10 · **Priority:** P2 · **Scope:** every request (one location)

**File:** `src/services/api/core/client.ts:68-70` (and `:46` for an unrecognized failure body).

**What is wrong:** when a success body does not match the Zod schema (a contract drift between backend and dashboard), the code throws an `ApiClientError` with code `Server` and an empty message. The Zod issues are discarded; nothing is logged, and neither the path nor the `requestId` is recorded.

**Impact:** the project policy is that the backend changes freely, so drift is expected. The user then sees a generic "server error" and the developer cannot tell which endpoint or field broke. Diagnosis time is higher than it needs to be, and the mobile apps share the API, which makes drift more likely.

**Correction (small):** on `options.schema.safeParse` failure, log in development only (`console.error` with the path and `issues`), or attach `issues` to `ApiClientError` for monitoring. Do not expose details to end users.

**Independent.**

---

## Inspected, no confirmed problems

- **Invalidation:** 59 `invalidate: [xKeys.all]` calls. Invalidating a root refetches only active queries, and each screen has few; no evidence of over-fetching. Not a problem.
- **Server-state ownership:** TanStack Query only; Zustand holds no server data except the profile (F-02).
- **Data transformation:** schemas and their types live together (`schemas/` + `types/` via `z.infer`); no diverging API/UI models found.
- **Loading/error states:** shared components exist (`SkeletonRows`, `ErrorScreen`, `EmptyState`). I did not verify that all five states exist on every list (inspection limit).
- **Duplicate calls:** none found; `useReferenceQuery`/`STALE_TIME` are used.
