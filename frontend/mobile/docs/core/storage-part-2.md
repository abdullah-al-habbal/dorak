---
nodeid: mobile.core.storage.part-2
parentnode: mobile.core.storage
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 3 · [Storage](storage.md) · [Previous](storage.md) · [Next](storage-part-3.md)

## AppPreferences

`lib/src/storage/preferences.storage.dart`

```dart
abstract class AppPreferences {
  bool get dontShowOnboarding;
  Future<void> setDontShowOnboarding(bool value);
}
```

`dontShowOnboarding` is a **synchronous** getter: the post-splash gate branches
on it without an await. `SharedAppPreferences` therefore wraps an
already-resolved `SharedPreferences` instance; use the async factory once during
bootstrap:

```dart
final preferences = await SharedAppPreferences.create();
```

Key `dont_show_onboarding`, default `false`. Semantics are defined in
`flows/onboarding.md` — in particular `Skip for now` does **not** set it.

`create()` exists so apps never declare `shared_preferences` themselves.
