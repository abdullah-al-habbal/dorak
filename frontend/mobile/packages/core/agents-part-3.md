---
nodeid: mobile.packages.core.part-3
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 3 · [AGENTS.md — packages/core](AGENTS.md) · [Previous](agents-part-2.md)

## 2. Config

```dart
ConfigProvider.config.apiBaseV1Url   // throws StateError if dotenv not loaded
```

Keys, per app `.env` (gitignored; `.env.example` committed):

```
API_BASE_URL=https://dev-dorak-backend.io/api
API_BASE_URL_V1=https://dev-dorak-backend.io/api/v1
```

There is no local-dev profile — no `localhost` or `10.0.2.2` anywhere.

## More

| Topic | Read |
| --- | --- |
| ApiClient, envelope, exceptions (§3) | [`references/networking.md`](references/networking.md) |
| Repositories (§4) | [`references/repositories.md`](references/repositories.md) |
| Session blocs (§5) | [`references/session.md`](references/session.md) |
| Storage + adding things (§6–7) | [`references/storage.md`](references/storage.md) |
| Gotchas (§8) | [`references/gotchas.md`](references/gotchas.md) |
| Tests (§9) | [`references/tests.md`](references/tests.md) |

## 10. Commands

```bash
cd frontend/mobile
dart run melos run build     # after a DTO change
dart run melos run analyze
dart run melos run test
```
