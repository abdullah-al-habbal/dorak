---
nodeid: mobile.core.storage
parentnode: mobile.docs
childnodes:
  - mobile.core.storage.part-2
  - mobile.core.storage.part-3
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Storage

Status: `DONE`

## Purpose

`packages/core` owns all device persistence. Apps must not add a second storage
stack; they consume the contracts below through `package:core/core.dart`.

Two stores, split by sensitivity:

| Store | Backing | Holds |
| --- | --- | --- |
| `TokenStorage` | `flutter_secure_storage` (Keychain / EncryptedSharedPreferences) | the Sanctum bearer token |
| `AppPreferences` | `shared_preferences` | `dontShowOnboarding` |

Both are declared as abstract classes so tests substitute in-memory fakes and
never touch a platform channel.

## TokenStorage

`lib/src/storage/token.storage.dart`

```dart
abstract class TokenStorage {
  Future<String?> read();
  Future<void> write(String token);
  Future<void> clear();
}
```

`SecureTokenStorage` is the production implementation. Key `dorak_client_token`;
Android uses `AndroidOptions(encryptedSharedPreferences: true)`. `read()`
normalises an empty string to `null` so callers only test for null.

The token is the credential for a **non-expiring** server-side session
(`SANCTUM_EXPIRATION` is unset on the backend), which is why it must not live in
plain preferences.

`ApiClient` is wired to it directly:

```dart
ApiClient(
  baseUrl: ConfigProvider.config.apiBaseV1Url,
  tokenProvider: _tokenStorage.read,   // activates AuthInterceptor
);
```

Reading storage rather than the session layer keeps construction acyclic —
`SessionBloc` depends on `ApiClient`, not the other way round.

## Continued in

- [Part 2: AppPreferences](storage-part-2.md)
- [Part 3: Feed cache (Track 05 — cache strategy, DONE)](storage-part-3.md)
