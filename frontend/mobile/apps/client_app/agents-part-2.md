---
nodeid: mobile.apps.client-app.part-2
parentnode: mobile.apps.client-app
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [AGENTS.md — apps/client_app](AGENTS.md) · [Previous](AGENTS.md)

## More

| Topic | Read |
| --- | --- |
| Bootstrap, launch gate, auth flow (006–014), onboarding flow (002–005) | [`references/bootstrap-and-flows.md`](references/bootstrap-and-flows.md) |
| Feature status — built vs not built | [`references/feature-status.md`](references/feature-status.md) |
| Decisions that are not in the code (§7) | [`references/decisions.md`](references/decisions.md) |
| Tests — 145, in `test/` | [`references/tests.md`](references/tests.md) |

## 9. Known limitations

- Onboarding screens 002–005 lay out in a non-scrolling `Column` and clip on
  short viewports.
- `README.md` is untouched Flutter template boilerplate.
- Locale toggle is in-memory and resets on restart.

## 10. Commands

```bash
cd apps/client_app
flutter run
flutter test

cd frontend/mobile && dart run melos run verify
```

Base URL comes from `.env` (gitignored, `.env.example` committed) and points at
`https://dev-dorak-backend.io/api/v1`. There is no local-dev profile.
