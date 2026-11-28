---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 3 of 3 · [Password Recovery](password-recovery.md) · [Previous](password-recovery-part-2.md)

## 4. Reuse

Nothing new was invented. `AuthShell` (layout), `AuthHeader`, `AuthTextField`,
`OtpInputField`, `StatusBanner`, `PrimaryButton.isLoading`, `AuthValidators`,
`ErrorFeedback.from`, and the 60 s cooldown pattern from `verify_account_content`.

## 5. Known limits

- A successful reset ends every session of the account, in the apps and on the dashboard. If the backend fails while
  ending them, the old password stays, but the code is already used up, so the user asks for a new one.
- Whether a code arrives depends on the backend's mail setting.
- The backend throttles `forgot-password` and `reset-password` (5 a minute); the 60 s cooldown in the app is only
  for the user.

## 6. Verification

```bash
cd frontend/mobile
dart run melos run verify
```

`password_recovery_bloc_test.dart` (8) covers the transitions, the enumeration
mitigation, and the carried code. `password_recovery_flow_test.dart` (6) covers the
route walk end to end, including that an unregistered email still advances and that
a rejected code offers a way back to 012.
