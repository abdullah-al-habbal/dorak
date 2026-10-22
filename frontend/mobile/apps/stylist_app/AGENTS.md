# AGENTS.md — `apps/stylist_app`

**Status (2026-10-22): login, session, today/operations screen and barber self
sign-up exist. Sections 2–3 below predate that and are kept for history; audit
against the code (Task 82/87).**

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)
· Files: [`docs/feature-index.md`](./docs/feature-index.md)

---

## 1. What is actually here

```
lib/main.dart                               bootstrap
lib/app.dart                                StylistApp: ApiClient, StaffSessionBloc, StylistBloc,
                                            StylistSignUpBloc, realtime, push (constructor DI)
lib/src/core/navigation/app.router.dart     go_router: /login, /signup (public), /home
lib/src/features/auth/                      stylist_login.screen, stylist_sign_up.{screen,bloc,state},
                                            stylist_sign_up_step.entity
lib/src/features/operations/                stylist.{screen,bloc,state} — today + workstation
```

### Self sign-up (Task 37)

`/signup` posts `POST barber/register`, then offers the emailed code
(`POST barber/email/verify`, skippable) and ends on an "awaiting approval" step.
New barbers are `pending` until an admin activates them, and the backend
refuses their login with `ACCOUNT_NOT_ACTIVE` (shown on the login screen).

The registration token only reaches the onboarding routes (profile read, email
verification) while pending, so it is **not** a session: `StylistSignUpBloc`
holds it in memory, `app.dart`'s `ApiClient` token provider reads it before the
stored session token, and leaving the flow (`reset()`) drops it. It is never
written to `SecureBarberTokenStorage`.

## 2. What it is meant to become

The stylist/barber app: offered services, availability, schedule, reviews, job
applications (per its own feature index). None of it is specced — there are no
Stitch exports for stylist-facing screens.

Note the distinction: `docs/stitch/exports/019_stylist_profile/` is the
**customer's view of a stylist**, and belongs to `client_app`. It is not a
screen for this app.

`dorak-backend` has a `/barber` route group with its own guard and a
`GET /profile`, but nothing has been mapped for this app.

## 3. Bringing it into the monorepo

Do this before any feature work, and copy `client_app` rather than improvising:

1. **Add the workspace dependencies** (`core`, `design_system`, `localization`,
   `flutter_localizations`) — see [`CLAUDE.md`](./CLAUDE.md) §2.
2. **Replace the scaffolding.** Delete `MyApp` / `MyHomePage` / `_counter` and
   the stray comment lines. Split bootstrap into `lib/main.dart` +
   `lib/app.dart` exactly as `client_app` does: binding init → dotenv →
   `SharedAppPreferences.create()` → root widget.
3. **Wire `ApiClient` with `tokenProvider`**, or `AuthInterceptor` never
   installs and every request goes out unauthenticated with no error.
4. **Set up localization** — `localizationsDelegates`, `supportedLocales`, and
   `DorakTheme.forLocale(locale, brightness)`. All three apps share one ARB
   pair; add stylist keys there.
5. **Rewrite `test/widget_test.dart`.** It still asserts the counter increments
   and will fail the moment the scaffolding goes.
6. **Decide the auth story.** `SessionBloc` and the `/client/*` routes are
   customer-specific. A barber authenticates against a different guard — do not
   reuse the client session layer without checking the contract.

## 4. Constraints

- Everything under `lib/src/` must carry a valid role suffix — `.screen.dart`,
  `.widget.dart`, `.navigator.dart` and so on. Files at `lib/` root are exempt,
  which is why the current `main.dart` passes.
- `.screen.dart` is permitted here (apps only). `.navigator.dart` is still
  accepted for this stub but is **deprecated** — when work starts, mirror
  `client_app`'s go_router layout (`app.router.dart`), and use `.router.dart`,
  `.bloc.dart`, `.event.dart`, `.state.dart` roles. `.token.dart`, `.theme.dart`
  and `.storage.dart` are not.
- Check the current execution point in `docs/index.md` before starting. No Track
  is dedicated to this app yet.

## 5. Commands

```bash
cd apps/stylist_app
flutter run
flutter test

cd frontend/mobile && dart run melos run verify
```
