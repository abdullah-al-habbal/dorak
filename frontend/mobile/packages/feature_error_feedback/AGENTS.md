---
codeanchors:
  - frontend/mobile/packages/feature_error_feedback/lib/
---

# `packages/feature_error_feedback`

How the apps turn a failed request into what the user reads. Adds to the [mobile guide](../../AGENTS.md).
Message rules: [authentication flow](../../docs/authentication/auth-flow-part-2.md).

| API | Use |
| --- | --- |
| `ErrorFeedback.from` | a failed action: banner message plus field errors |
| `ErrorFeedback.loadMessage` | a failed load |
| `InlineError` | a failed action shown in place |
| `SafeServerMessage` | the filter for server validation messages |
| `DeleteAccountErrorMessage` | a refused account deletion; `byCode` adds app-only refusals |
| `ExternalLinkFeedback.open` | open a link and report a failure |

## Rules

- Dependencies: Flutter, `core`, `localization` and `design_system`; `dio` in tests only. No app code, state
  management or navigation.
- Roles here are `provider` (stateless presentation logic) and `widget`.
- Never render `ApiException.message`. A server string reaches the UI only through `SafeServerMessage`.
- Compare error codes through `ApiErrorCodeConstants`.
- No wording that is true for only one app. App wording stays in the app.
- `showsFieldMessagesInBanner` is only for places without inline field errors.
