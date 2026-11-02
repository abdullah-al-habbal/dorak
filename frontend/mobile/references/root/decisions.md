---
nodeid: mobile.references.root.decisions
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 9. Decisions that are not in the code

The app layer has no comments. These are the non-obvious choices — **check here
before "simplifying" any of them.**

### Password recovery (Stitch 011–014)

| Choice | Why |
|---|---|
| A 422 from forgot-password **does not** surface; the flow advances anyway | The backend validates `exists:clients,email`, so showing "not registered" would make the API an account-enumeration oracle. Neutral copy instead. A `NetworkException` **does** surface — the user genuinely cannot proceed |
| The OTP screen does not validate the code | There is no verify-reset-code endpoint. The code is carried in state and first checked when `reset-password` is submitted, so a bad code surfaces on screen **013** with a "Re-enter code" route back to 012 |
| `RecoveryCodeEntered` raises a signal instead of the screen pushing directly | `bloc.add` goes through the event queue, so a direct push could build 013 before the code reached state. Routing on the emitted state makes the ordering correct by construction |
| Recovery resend calls `forgotPassword`, not `sendEmailVerification` | Different endpoints, different throttles (`email/verify/send` is `throttle:3,1`). Conflating them sends the wrong kind of code |
| `PasswordRecoveryBloc` lives in `client_app`, not `core` | Session truth is shared infrastructure (ADR 0001); recovery is a client feature flow. Same shape as `OnboardingConfigBloc` — an app bloc over a core repository |
| 014 exits with `go`, not `push` | The code has been consumed; a completed reset must not be back-navigable |
| The onboarding hero keeps its asset fallback on a config failure | The bundled asset is always available, so an error view would be strictly worse. The failure is a layered retry, never a replacement |

| Code | Why it is that way |
|---|---|
| `ApiClient(tokenProvider: _tokenStorage.read)` | Reads storage directly, not `SessionBloc`. `SessionBloc` depends on `ApiClient`; going the other way would be a construction cycle. Also the only thing that activates `AuthInterceptor`. |
| `unawaited(_session.ready)` in `initState` | Restore runs concurrently with the 2500 ms splash so the gate adds no wait of its own. |
| `AppGate` awaits `session.ready`, not `RestoreRequested` | `ready` memoises the restore pass; re-adding `RestoreRequested` would fire a second pass. |
| `goHome()` uses `pushAndRemoveUntil` | `pushReplacement` swaps only the top route — onboarding and auth screens stayed alive underneath Home and were reachable by back gesture, and from inside a bottom sheet it replaced the *sheet*. **Gone in Phase 2**: auth/onboarding success uses `context.go('/home')` (declarative `go_router`), which clears the stack by construction. |
| `SkipBottomSheet` pops itself before invoking callbacks | Otherwise navigation fires while the modal route is still on top. It now pops with `context.pop()`. |
| `_dismissForever` writes in `try`, navigates in `finally` | A failed preference write must not strand the user on the tour. |
| `onSkipForNow: () => context.go('/home')` — no flag write | Deliberate: `Skip for now` ≠ `Don't show again`. The tour must reappear next cold start. |
| Register never calls `sendEmailVerification()` | The backend owns the OTP lifecycle — registration dispatches `SendEmailVerificationCodeJob` (after commit, async) and the client moves straight to the verify screen, whose Resend is the only client-side retry. Keeps registration atomic client-side. |
| `onForgotPassword: null` | Nullable hides the link. Stitch 011–014 do not exist; a visible dead button is worse than none. |
| `AppNavigator`/`.navigator.dart` removed in Phase 2 | Navigators were imperative and un-testable; go_router's declarative table + redirects replaced the whole `core/navigation/` layer. Legacy claim: `SessionRedirect` (401 → auth) used to live in a navigator; it now hooks the router's listener. |
| Login/sign-up say **"Email"**, not the design's "Email or Phone" | The backend accepts email only; the design label would guarantee a 422. |
| `AuthEntryBackground` reused by login and sign-up | Deliberately not duplicated into a second blobs widget. |
| `AuthTextField` / `OtpInputField` live in the app, not `design_system` | Promotion is Track 15. Do not move them early. |
| `Wrap` instead of `Row` in the auth footers | The prompt + link overflow a narrow screen once Arabic or a large text scale widens them. |
| `SizedBox(height: 24)` around the verify error banner | Reserved height stops the button jumping when an error appears. |
| `OtpInputField` drives focus from `onChanged`, with `onKeyEvent` as an extra | Soft-keyboard deletions arrive on the text-input channel, not the key channel, so backspace-on-empty cannot be observed there. |
| `AuthHeader`'s trailing `SizedBox(width: 64)` + `FittedBox` | Balances the leading `IconButton` so the brand stays optically centred; the right slot hosts the shared `LocaleSwitcher` (scale-down) and mirrors the back button's 64 px width. |
| `_discardBody` parser on logout/verify | Those endpoints answer 200 with no `data` key; there is nothing to decode. |
| `restore()` keeps the session on `NetworkException` | Sanctum tokens have no server-side expiry, so an unreachable server is no evidence the session died. |
| `NetworkException` carries `DioExceptionType` | Which is why `client_app` has a **test-only** `dio` dev dependency. |

---

