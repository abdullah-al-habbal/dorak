---
nodeid: mobile.authentication.password-recovery.part-3
parentnode: mobile.authentication.password-recovery
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 3 of 3 · [Password Recovery](password-recovery.md) · [Previous](password-recovery-part-2.md)

## 4. Reuse

Nothing new was invented. `AuthShell` (layout), `AuthHeader`, `AuthTextField`,
`OtpInputField`, `StatusBanner`, `PrimaryButton.isLoading`, `AuthValidators`,
`ErrorFeedback.from`, and the 60 s cooldown pattern from `verify_account_content`.

**Screen 014 is `StatusView`'s first production consumer** — icon, title, message,
single action is exactly its shape. That is what validates the Track 12 contract on
something real.

## 5. Known limits

- **`MAIL_MAILER=log` on dev** — the code only ever reaches
  `storage/logs/laravel.log`. Read it from there when testing by hand. Pre-existing
  backend defect, unrelated to this track.
- **forgot-password is unthrottled** server-side, so the client's 60 s cooldown is
  the only rate limit. Client-side only, therefore bypassable.
- No "change password while signed in" — `/client/password` exists but belongs to
  Track 17.

## 6. Verification

```bash
cd frontend/mobile
dart run melos run verify
```

`password_recovery_bloc_test.dart` (8) covers the transitions, the enumeration
mitigation, and the carried code. `password_recovery_flow_test.dart` (6) covers the
route walk end to end, including that an unregistered email still advances and that
a rejected code offers a way back to 012.
