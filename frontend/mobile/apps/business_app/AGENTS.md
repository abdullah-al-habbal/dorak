---
nodeid: mobile.apps.business-app
parentnode: mobile.guide
childnodes:
  - mobile.apps.business-app.claude
  - mobile.apps.business-app.feature-index
  - mobile.apps.business-app.readme
  - mobile.apps.business-app.part-2
codeanchors:
  - frontend/mobile/apps/business_app/lib/
---

# AGENTS.md — `apps/business_app`

**Status: `flutter create` counter stub. No Dorak features exist.**

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)
· Files: [`docs/feature-index.md`](./docs/feature-index.md)

---

## 1. What is actually here

```
lib/main.dart                 67 lines — MyApp + MyHomePage + _counter
test/widget_test.dart         the default counter test
.env / .env.example           present, and dotenv IS loaded
docs/feature-index.md         records "App is a skeleton"
```

That is the entire app. `main.dart` is the stock Flutter demo with exactly one
edit — `main()` is `Future<void>` and awaits `dotenv.load()`:

```dart
Future<void> main() async {
  await dotenv.load();
  runApp(const MyApp());
}
```

`.env` carries the same backend URLs as the other apps:

```
API_BASE_URL=https://dev-dorak-backend.io/api
API_BASE_URL_V1=https://dev-dorak-backend.io/api/v1
```

...but nothing reads them — `ConfigProvider` lives in `core`, and this app does
not depend on `core`.

**Its `pubspec.yaml` declares no workspace packages**: no `core`, no
`design_system`, no `localization`. It is in the Melos workspace and passes the
gate only because it is untouched.

> `docs/feature-index.md` claims `main.dart` boots `DorakApp`. It does not — it
> boots `MyApp`. The doc is wrong.

## Continued in

- [Part 2: 2. What it is meant to become](agents-part-2.md)
