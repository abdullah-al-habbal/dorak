---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Client app routes

`go_router` only. The code is in `apps/client_app/lib/src/core/navigation/`:

| File | Owns |
|---|---|
| `app.router.dart` | `AppRouter`: builds the router, runs the launch gate, listens for session and sign-in signals and passes navigation callbacks into screens |
| `app_routes.entity.dart` | `AppRoutes`: every path. Read it for the route list |
| `app_gate.entity.dart` | `AppGate.resolve`: where the app goes after the splash ([launch](../flows/app-launch.md)) |
| `notification_location.entity.dart` | Where a tapped notification goes |

The paths cover the splash, the onboarding tour, sign-in and password recovery, profile completion, phone
verification, and a tabbed shell (`StatefulShellRoute`) with Discover, Bookings, Favorites and Profile. `/home` is a
legacy path that redirects to Discover.

Screens receive callbacks and don't know their neighbours. A bloc never navigates.

## Signals

| Signal | Navigation | Why |
|---|---|---|
| `SessionSignal.sessionExpired` or `accountBanned` | `go` to `/auth` | Replaces the stack, so a dead session can't be reached with Back |
| `SessionSignal.authenticationRequired` | `push` `/auth` | Back returns to the guest screen |
| `AuthSignal.loginSucceeded` | `push` verification if the email isn't verified; otherwise `go` to Discover, or to profile completion first | |
| `AuthSignal.registrationSucceeded` | `push` verification | |
| `AuthSignal.verificationSucceeded` | `go` to Discover or profile completion | |
| `RecoverySignal` (code sent, code accepted, password reset) | `push` the next recovery step ([password recovery](../authentication/password-recovery.md)) | Each step can go back |
| "Log in" on the reset success screen | `go` to sign-in | The code is used up |

The router acknowledges a signal after acting on it; after a session signal it also calls
`apiClient.resetUnauthorizedSignal()`.

## Notifications

A tapped review notification opens that review; a booking update opens the bookings list, because the payload has no
booking object. Invitations, applications and unknown kinds don't navigate. General deep links aren't handled
(backlog FT-25).
