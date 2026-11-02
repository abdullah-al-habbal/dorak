---
nodeid: mobile.packages.core.claude.part-2
parentnode: mobile.packages.core.claude
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 2 · [CLAUDE.md — packages/core](CLAUDE.md) · [Previous](CLAUDE.md)

## 4. Hard rules

1. **One HTTP stack.** Everything goes through `ApiClient`. Never construct a
   bare `Dio` outside `api.client.dart`, never add `http`.
2. **No transport type escapes.** A `DioException` must never reach a caller —
   `ApiClient._guard` maps it. The one deliberate leak is
   `NetworkException.type`, which is a `DioExceptionType`; do not widen that.
3. **DTOs are generated.** Every `*.dto.dart` declares
   `part '<name>.dto.g.dart'` and `@JsonSerializable`. Hand-written `fromJson`
   is forbidden for wire models. Response DTOs use `createToJson: false`;
   generics use `genericArgumentFactories: true`. Run `melos run build` after
   editing one and commit the `.g.dart`.
4. **`.entity.dart` is for value objects only** — no JSON, no codegen.
5. **Endpoints stay domain-split.** One `<domain>.endpoints.dart` per backend
   module. A monolithic route file is a violation.
6. **Never hardcode a base URL.** It comes from `.env` through
   `ConfigProvider`. Tests pass an explicit `baseUrl`.
7. **Do not invent endpoints.** Only add a route constant that exists in
   `dorak-backend`.
8. **Storage contracts stay abstract.** Every store is an abstract class plus a
   concrete implementation in the same file, so tests can substitute a fake and
   never touch a platform channel.
9. **Abstract + impl in one file.** `AuthRepository` + `DioAuthRepository`,
   `TokenStorage` + `SecureTokenStorage`. Do not split them.
10. **Export through barrels.** A new public type must be reachable from
    `lib/core.dart`, via its section barrel.

## 5. State management

@references/state-management.md

## 6. Verification

@references/verification.md
