---
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# Design system: states and loading

Which shared widget shows each state. `design_system` never resolves a string ([mobile guide](../../AGENTS.md#layers)):
the app passes localized text in and picks the widget from bloc state. Map failures to text with `ErrorFeedback.from`
(`packages/feature_error_feedback`).

| State | Use |
|---|---|
| Full-page loading | `AppLoader.page()` |
| Inline loading, such as a list footer | `AppLoader.inline()` (size 20 by default) |
| Button loading | `PrimaryButton(isLoading: true)`: shows a spinner and blocks presses. `SecondaryButton` has no loading flag |
| Skeleton | `ShimmerBox(width, height, borderRadius?)`, hand-rolled; no app uses it yet |
| Empty | `StatusView(icon, title, message?)` in the neutral tone, with feature wording; an action is optional |
| First load failed | `StatusView` with `iconColor` set to the error colour, plus `actionLabel` and `onAction` |
| Compact or footer error | `StatusBanner(message, color?, actionLabel?, onAction?)` |
| Offline | The error state with `errorNetwork` text. There is no connectivity package: the failed request is the signal |
| Retry | Not a widget: `actionLabel` and `onAction` on the two widgets above. The callback sends the failed event again |
| Refresh | `RefreshIndicator`; a failed refresh keeps the list and shows a `SnackBar` |
| Success | No widget |
| Session expired | No widget: the router goes to sign-in ([guards](../navigation/guards.md)) |
| Sign-in required | No widget: a guest action sends `RequireAuthentication` and the sign-in entry opens on top |

For paged lists, the state to widget mapping follows [pagination](../state-management/pagination.md).
