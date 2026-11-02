---
nodeid: mobile.packages.localization.references.keys.part-3
parentnode: mobile.packages.localization.references.keys
childnodes: []
codeanchors:
  - frontend/mobile/packages/localization/lib/
---

Part 3 of 3 · [keys](keys.md) · [Previous](keys-part-2.md)

## 4. Parameterised keys

Ten, and they generate **methods**, not getters:

```dart
String verifySubtitle(String email);        // "…code we sent to {email}"
String verifyResendDisabled(int seconds);   // "Resend Code ({seconds}s)"
String discoverDistanceLabel(double km);    // "{km} km"
String discoverRankBadge(int rank);         // "#{rank}"
String discoverCompatibilityBadge(int percent); // "{percent}%"
String branchChairsCount(int count);        // "{count} chairs"
String historyRebookMessage(String item);   // "Rebook {item}?"
String curatedPriceRange(num min, num max, String currency); // "{min}–{max} {currency}"
String serviceDurationLabel(int minutes);   // "{minutes} min"
String servicePrice(String displayPrice, String currency); // "{displayPrice} {currency}"
```

ARB form:

```json
"verifyResendDisabled": "Resend Code ({seconds}s)",
"@verifyResendDisabled": {
  "description": "Verify account resend action during cooldown",
  "placeholders": { "seconds": { "type": "int" } }
}
```

Everything else is a plain getter. There are no plurals or `select` messages
yet — adding one is fine, but declare the placeholder type.
