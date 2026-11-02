---
nodeid: mobile.authentication.password-recovery
parentnode: mobile.docs
childnodes:
  - mobile.authentication.password-recovery.part-2
  - mobile.authentication.password-recovery.part-3
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Password Recovery

Status: `DONE` — Stitch 011–014, four routes, live backend.

Flow: `/auth/login` → `/auth/forgot-password` → `/auth/forgot-password/otp` →
`/auth/reset-password` → `/auth/reset-password/success` → `/auth/login`.

---

## 1. The backend contract, and the three things it forces

```
POST /client/forgot-password   { email }
    email: required, email, exists:clients,email

POST /client/reset-password    { email, code, password, password_confirmation }
    code:     required, size:6
    password: required, min:8, confirmed
```

Both already existed in `AuthRepository` (`packages/core`) before this track; no
core change was needed.

### A. There is no verify-reset-code endpoint

The complete client auth route list is login, register, social, forgot-password,
reset-password, logout, refresh-token, avatar, email/verify, email/verify/send.
**Nothing validates a recovery code on its own.** `ForgotPasswordHandler` stores it
as `Cache::put("password_reset_{$client->id}", $code, now()->addMinutes(10))`, and
only `ResetPasswordHandler` reads it back.

Consequence, and it is the defining shape of this flow: **the OTP screen (012)
cannot validate the code.** It collects six digits and carries them in state; the
code is first checked when 013 submits `reset-password`. So a wrong or expired code
surfaces on **013**, after the user has already typed a new password.

`CreateNewPasswordContent` therefore inspects
`PasswordRecoveryState.isCodeRejected` (a `code` key in the `ValidationException`
errors) and renders a `StatusBanner` with a **"Re-enter code"** action back to 012 —
not just inline text under a field, which would leave the user stuck.

Do not add a client-side "verify code" step. There is no endpoint for it, and
inventing one would mean guessing at an API.

### B. The code expires in 10 minutes

Longer than the 60 s resend cooldown, so the cooldown UX is compatible. Stated in
`recoveryOtpSubtitle` so the user knows.

## Continued in

- [Part 2: C. exists:clients,email is an account-enumeration oracle](password-recovery-part-2.md)
- [Part 3: 4. Reuse](password-recovery-part-3.md)
