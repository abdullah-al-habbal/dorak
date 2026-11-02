Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 7. Feature inventory

### Built

| Area | Where |
|---|---|
| Design tokens, theme, 14 shared widgets | `packages/design_system` |
| Localization EN + AR, 192 keys, RTL | `packages/localization` |
| Networking, interceptors, exceptions, pagination | `packages/core/lib/src/network` |
| Storage (secure token + preferences) | `packages/core/lib/src/storage` |
| Feed cache strategy (Track 05) | `packages/core/lib/src/storage/feed_cache.storage.dart` |
| Session lifecycle | `packages/core/lib/src/session` |
| Auth repository (9 methods over 10 route constants) | `packages/core/.../repositories/auth.repository.dart` |
| Splash | `client_app/.../features/splash` (Stitch 001) |
| Onboarding tour, 4 steps + skip sheet | `client_app/.../features/onboarding` (002–005) |
| Auth entry / login / sign-up / verify | `client_app/.../features/auth` (006–009) |
| Password recovery, 4 screens | `client_app/.../features/auth` (011–014) |
| Launch gate + go_router route table | `client_app/.../core/navigation` |
| Discovery feed (016) | `client_app/.../features/discovery` (bloc + screen + filter bar + result card over core `Paged`/`FeedCache`) |
| Home placeholder | `client_app/.../features/home` (superseded — Discover tab renders the feed; file unused) |
| My Bookings — list/filter/cancel (017a) | `client_app/.../features/booking` (bloc + screen + card over core `Paged`/`BookingDto`) |
| Branch floor-plan detail + booking creation (017b) | `client_app/.../features/booking` (branch detail bloc/screen + `FloorPlanGrid` over `BranchDetailDto`/`FloorPlanDto`; `createBooking` in core) |
| Favorites placeholder | `client_app/.../features/profile` |
| Service History + Rebook (018a) | `client_app/.../features/profile` + core `HistoryRepository` (`getHistory`/`rebookFromHistory` over `ServiceHistoryDto` family) — Profile tab header card, history feed, rebook |
| Face Analysis + AI Style (018b) | `client_app/.../features/profile` (`FaceAnalysisBloc` + `AvatarBloc` over `PhotoPicker` seam) + core `FaceProfileRepository`/`ProfileRepository`/`ServiceCatalogRepository` over `FacePhotoDto`/`FaceAnalysisResultDto`/`AvatarDto`/`CatalogItemDto` — avatar header, face card, Curated For You |
| Profile tab rebuilt (018a–018b) | `client_app/.../features/profile/profile.screen.dart` |
| Stylist Profile (019) | `client_app/.../features/stylist` (bloc + screen) + core `ExploreRepository`/`CurrencyRepository` (`getBarberDetail`/`getCurrencies`, `BarberProfileDto`/`BarberServiceDto`/`CurrencyDto`) — profile from branch-detail barbers entry, `/discover/barber/:barberId` |

### Not built — do not assume these exist

- Profile completion (Stitch 010), Review (020).
  Discovery Feed (016) is **built**;
  My Bookings list/filter/cancel (017a), branch floor-plan detail + booking
  creation (017b), Service History + Rebook (018a), and Face Analysis + AI
  Style (018b) are **built**.
- **Favorites: no backend route, no client UI.** `rg favorite` in
  `backend/modules/` is empty. Do not fake a local-only favorite toggle.
- Authenticated password change (Track 17) **is built** — `PATCH
  /client/password` via `AuthRepository.changePassword`, form screen entered
  from the Profile tab. Password *recovery* (011–014) **is** built.
- Social login. The endpoint constant exists; the backend has no configured
  Socialite drivers, so it always 401s.
- Per-route auth guards (beyond the launch gate + 401 redirect), guest guards,
  deep links, push-tap routing. (The notification inbox is built — Task 30,
  client_app `/profile/notifications`.)
- Logout UI. `SessionBloc` handles `LogoutRequested`; no affordance calls it.
- DI container. Wiring is manual construction in `DorakApp.initState`.
- Locale persistence. The toggle is in-memory and resets on restart.
- `business_app` / `stylist_app` feature coverage is shipped (Tasks 82–85). Not built: stylist "request affiliation" (no branch picker endpoint) and the business floor-plan zone editor.
- Design-system inputs, cards, chips, dialogs, app bars. Session-expired and
  authentication-required flows exist (Track 06/11), and Track 12 added the
  loading/empty/error/offline/retry state widgets — **consumed only by auth
  (`StatusBanner`); the rest await Discovery 016**. Track 15 covers inputs,
  cards, chips, dialogs — **only the 14 widgets in §10 exist**. Track 12
state components (`StatusView`, `AppLoader`, `ShimmerBox`, `StatusBanner`)
are consumed by auth **and** the Discovery feed.

---

