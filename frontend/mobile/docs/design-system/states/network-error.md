---
nodeid: mobile.design-system.states.network-error
parentnode: mobile.design-system
childnodes: []
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# Network Error State

Component: `StatusView`

```dart
StatusView(
  icon: Icons.cloud_off,
  title: l10n.errorTitleGeneric,
  message: l10n.errorGeneric,
  iconColor: DorakColors.of(context).error,
  actionLabel: l10n.actionRetry,
  onAction: retry,
)
```

Full-page failure of a first load (`Paged<T>.hasFailedFirst`). Pass
`colors.error` as `iconColor` to switch the neutral default to the error tone.
The `errorGeneric` / `errorNetwork` ARB message bodies are existing keys; the
title key (`errorTitleGeneric`) is the Track 12
fallbacks.

Mapping exceptions to ARB strings lives in `feature_error_feedback`
(`ErrorFeedback.from`) and the apps — `design_system` never resolves a string.