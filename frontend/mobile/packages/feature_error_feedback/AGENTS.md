---
nodeid: mobile.packages.feature-error-feedback
parentnode: mobile.guide
childnodes:
  - mobile.packages.feature-error-feedback.claude
  - mobile.packages.feature-error-feedback.readme
codeanchors:
  - frontend/mobile/packages/feature_error_feedback/lib/
---

# AGENTS.md — `packages/feature_error_feedback`

How all three apps turn a failed request into what the user reads. Scoped rules:
[`CLAUDE.md`](./CLAUDE.md). Message rules:
[authentication flow](../../docs/authentication/auth-flow-part-2.md).

Import `package:feature_error_feedback/feature_error_feedback.dart`.

| API | Use |
| --- | --- |
| `ErrorFeedback.from` | a failed action: banner `message` plus `fieldErrors` |
| `ErrorFeedback.loadMessage` | a failed load |
| `InlineError` | a failed action shown in place (wraps `StatusBanner`) |
| `SafeServerMessage` | the filter for server validation messages |
| `DeleteAccountErrorMessage` | a refused account deletion; `byCode` adds app-only refusals |
| `ExternalLinkFeedback.open` | open a link and report a failure |

## Gotchas

- App wording stays in the app: booking, rebook, review, phone, recovery, owner
  and sign-up messages. The business and stylist `FeatureError` widgets are thin
  wrappers that give `InlineError` the app's default message.
- `showsFieldMessagesInBanner` is only for forms without inline field errors.
  `InlineError` always sets it.
