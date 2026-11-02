---
nodeid: mobile.apps.client-app.references.verification
parentnode: mobile.apps.client-app
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Verification

Referenced from [`../CLAUDE.md`](../CLAUDE.md) §6.

```bash
cd frontend/mobile
dart run melos run verify          # the gate — must exit 0

cd apps/client_app
flutter test                       # 35 tests
```

Widget tests must use the fakes in `test/helpers/fakes.dart` and set a phone
viewport — the 800×600 default overflows these screens.

**Construct blocs inside the `testWidgets` body, never in `setUp`** — a bloc
built in `setUp` sits outside the FakeAsync zone, so its event stream never
delivers and `await session.ready` hangs. Drive it with `pump`/`pumpAndSettle`.
