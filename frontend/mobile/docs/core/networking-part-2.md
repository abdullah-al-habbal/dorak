---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 3 · [Networking](networking.md) · [Previous](networking.md) · [Next](networking-part-3.md)

## Config & Base URL

Configuration lives in each app's `.env` file (loaded at startup via
`flutter_dotenv`), accessed through the `core` config module:

* `lib/src/config/app_config.entity.dart` — `AppConfig` value object
  (`apiBaseUrl`, `apiBaseV1Url`).
* `lib/src/config/config.provider.dart` — `ConfigProvider.config` builds
  `AppConfig` from `dotenv`, throwing if not loaded.

Each app declares `.env` as an asset and loads it in `main()`:

```dart
Future<void> main() async {
  await dotenv.load();
  runApp(const DorakApp());
}
```

Environment keys:

| Key | Value |
| --- | --- |
| `API_BASE_URL` | `https://dev-dorak-backend.io/api` |
| `API_BASE_URL_V1` | `https://dev-dorak-backend.io/api/v1` |

Commit `.env.example`; keep `.env` (with real values) out of version control.
