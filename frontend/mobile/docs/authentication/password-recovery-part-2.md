---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 3 · [Password Recovery](password-recovery.md) · [Previous](password-recovery.md) · [Next](password-recovery-part-3.md)

### C. `exists:clients,email` is an account-enumeration oracle

A 422 from forgot-password means "this address is not registered". Surfacing it
would let anyone test whether an email has a Dorak account.

**Mitigation, client-side, no backend change:** `PasswordRecoveryBloc._onCodeRequested`
catches `ValidationException` and **still emits `RecoverySignal.codeSent`**, so the
flow advances identically for registered and unregistered addresses. Copy is neutral
— *"If {email} is registered, we've sent it a 6-digit code."*

A `NetworkException` or any other `ApiException` does **not** advance — the user
genuinely cannot proceed, and hiding that would be worse than the leak.

Trade-off, accepted: someone who mistypes their address waits for a code that never
arrives. They can go back and correct it, and resend re-triggers the request.

Covered by `password_recovery_bloc_test.dart` and `password_recovery_flow_test.dart`;
both name the reason, so the behaviour is not "simplified" later by someone who
reads it as a swallowed error.

## 2. Recovery resend is *not* email verification

Resend on 012 calls **`forgotPassword(email)` again**, which regenerates the code.

It is **not** `sendEmailVerification`. They are different endpoints with different
throttles — `/client/email/verify/send` carries `throttle:3,1`; forgot-password is
unthrottled (a recorded backend defect). Conflating them would send the wrong kind
of code.

## 3. State

`PasswordRecoveryBloc` lives in **`apps/client_app`**, not `packages/core`.
`SessionBloc`/`AuthBloc` are in core because every app needs session truth
(ADR 0001); password recovery is a client feature flow. The precedent is
`OnboardingConfigBloc` — an app-layer bloc over a core repository.

Extending `AuthBloc` was rejected: it would carry `email`/`code` fields that login,
register and verify never use, against `state-management/conventions.md` rule 5.

| Event | Effect |
|---|---|
| `RecoveryCodeRequested(email)` | `POST /client/forgot-password`; stores the email; `codeSent` |
| `RecoveryCodeEntered(code)` | `POST /client/forgot-password/verify`; stores the code; `codeAccepted` on 200, field error on 422 |
| `RecoveryPasswordSubmitted(password, passwordConfirmation)` | `POST /client/reset-password` with the carried email + code; `passwordReset` |
| `RecoverySignalAcknowledged()` | the router consumed the signal |

`RecoverySignal` is one-shot (`none | codeSent | codeAccepted | passwordReset`),
consumed by `AppRouter._onRecoveryChanged`, then acknowledged. **The bloc never
navigates** (conventions rule 44).

**Why `codeAccepted` is a signal rather than a direct `context.push`:** `bloc.add`
goes through the event queue, so a screen that pushed immediately could build 013
*before* the code reached state. Routing on the emitted state makes the ordering
correct by construction.

`copyWith` carries explicit `clearError` / `clearFieldErrors` flags — conventions
rule 12, the rule that exists because `copyWith(client: null)` was once a silent
no-op.
