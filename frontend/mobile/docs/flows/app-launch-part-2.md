---
nodeid: mobile.flows.app-launch.part-2
parentnode: mobile.flows.app-launch
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [App Launch](app-launch.md) · [Previous](app-launch.md)

## Resulting destinations

| Scenario | `isAuthenticated` | `dontShowOnboarding` | Destination |
| --- | --- | --- | --- |
| New user, first launch | `false` | `false` | Auth Entry |
| Returning guest (saw the tour) | `false` | `true` | Home |
| Returning logged-in user | `true` | ignored | Home |
| Just signed up | `true` | ignored | Home |
| Pressed "Don't show again" | `false` | `true` | Home |
| Completed the whole tour | `false` | `true` | Home |
| Token revoked server-side | `false` (token cleared) | as stored | Step B decides |
| Offline start with a stored token | `true` (token kept) | ignored | Home |

## Verification

```bash
cd apps/client_app && flutter test test/widget_test.dart test/app_gate_test.dart
```

`widget_test.dart` covers the real `DorakApp` bootstrap; `app_gate_test.dart`
covers every branch of the table above.
