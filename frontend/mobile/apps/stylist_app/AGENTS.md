---
nodeid: mobile.apps.stylist-app
parentnode: mobile.guide
childnodes:
  - mobile.apps.stylist-app.claude
  - mobile.apps.stylist-app.feature-index
  - mobile.apps.stylist-app.readme
  - mobile.apps.stylist-app.part-2
codeanchors:
  - frontend/mobile/apps/stylist_app/lib/
---

# AGENTS.md — `apps/stylist_app`

**Status (2026-11-03): a working barber/stylist app.** Sections 2–3 below
predate that and are kept for history.

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)
· Files: [`docs/feature-index.md`](./docs/feature-index.md)

---

## 1. What is actually here

```
lib/main.dart                               bootstrap
lib/app.dart                                StylistApp: ApiClient, session, blocs, realtime, push
lib/src/core/navigation/app.router.dart     /login, /signup (public); /home and its children:
                                            schedule, portfolio, profile, affiliations,
                                            reviews, jobs (+ applications, :jobId)
lib/src/features/                           affiliations, auth, jobs, operations, portfolio,
                                            profile, reviews, schedule, shared
```

**Not built yet:** history media upload, booking history beyond today, offered
service editing, the notification inbox, settings and earnings. See the
[product audit](../../../../docs/planning/product-audit-part-3.md), G1 and G11.

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

## Continued in

- [Part 2: 3. Bringing it into the monorepo](agents-part-2.md)
