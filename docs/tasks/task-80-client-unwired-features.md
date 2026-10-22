# Task 80: Wire Unwired Client Features

**Phase:** Phase 14 — Mobile · **Priority:** P2 · **Depends on:** Task 36 (account deletion rules), Task 41 (review dispute workflow), Task 44 (unisex universe), Task 47 (discovery preferences applied), Task 58 (history media as file upload), Task 60 (saved-filter contract), Task 42 (ratings) · **Audit source:** Mobile audit — "Unwired (no UI)" rows and "Backend routes for mobile with no mobile caller"

## Overview & Root Cause
Several client features have backend routes, and often repository methods, but no bloc or screen uses them. Each one is either a dead repository method or a missing method:
- Delete account.
- Preferred universe (discovery hard-defaults to `men` and never persists the choice).
- Saved filters (CRUD) and discovery preferences.
- History media attach.
- Branch reviews list.
- Review dispute.

## Evidence
- `frontend/mobile/packages/core/lib/src/network/repositories/auth.repository.dart:42` — `deleteAccount(String password)`, no bloc caller.
- `frontend/mobile/packages/core/lib/src/network/repositories/profile.repository.dart:10` — `updatePreferredUniverse`, no caller.
- `frontend/mobile/apps/client_app/lib/src/features/discovery/discovery_filter.entity.dart:5` — `this.universe = 'men'`.
- `frontend/mobile/packages/core/lib/src/network/repositories/client_interaction.repository.dart:4-12` — saved filters and discovery preferences methods. `DioClientInteractionRepository` is never instantiated in `apps/`, and there is no method for `GET client/saved-filters/{filter}` or `PUT client/saved-filters/{filter}`.
- `frontend/mobile/packages/core/lib/src/network/repositories/history.repository.dart:10` — `attachMedia`, no caller.
- `frontend/mobile/packages/core/lib/src/network/repositories/review.repository.dart:10` — `getBranchReviews`, no caller.
- `POST api/v1/client/reviews/{review}/dispute` exists in `routes.tsv`, but there is no endpoint constant or repository method in `packages/core`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None in this task. The contracts are finalized by Task 36 (delete rules), Task 41 (dispute), Task 44 (universe values), Task 47 (preferences consumed by Explore), Task 58 (media as file) and Task 60 (saved-filter shape).

### Dashboard (BFF / React)
- None — client-mobile-only features.

### Mobile (Flutter / Repositories)
- **Delete account**: add a confirm-with-password action in `profile.screen.dart` via a profile bloc event that calls `deleteAccount`. On success, clear the session and redirect to auth. Surface the 409 `ACCOUNT_HAS_ACTIVE_BOOKINGS` returned while any booking is pending, confirmed or in progress (finalized by Task 36); a wrong password is 401.
- **Universe**: persist the discovery universe toggle through `updatePreferredUniverse`. Seed `DiscoveryFilters.universe` from the session client's `preferred_universe` (from Task 33's payload) instead of the hard-coded `'men'`.
- **Saved filters / discovery preferences**: instantiate `DioClientInteractionRepository` in `app_services.provider.dart`. Add save/apply/delete filter UI in `discovery_filter_bar.widget.dart` and a preferences screen (default radius, hidden brands, show unavailable). Add `getSavedFilter(id)` / `updateSavedFilter` methods.
- **History media**: add a photo picker in `history_card.widget.dart` that calls `attachMedia` (multipart once Task 58 lands).
- **Branch reviews**: add a reviews section/screen on branch detail (`branch_detail_body.widget.dart`) that pages `getBranchReviews`.
- **Review dispute**: add `ReviewEndpoints.dispute` + `ReviewRepository.disputeReview(reviewId, reason)`, and a "Dispute" action on the client's own review view (`review_submitted_view.widget.dart`).

## Acceptance Criteria
- [ ] Bloc tests exist for each feature (delete account, universe persist, saved filter save/apply/delete, preferences update, history media attach, branch reviews pagination, dispute submit), each asserting the exact HTTP method + path called.
- [ ] Every repository method listed under Evidence has at least one non-test caller (verified by grep in CI review).
- [ ] After delete account, the session is cleared and the router redirects to the auth entry route (router test).
- [ ] Discovery starts with the persisted universe (bloc test with a seeded session client whose universe is `women`).
- [ ] `melos run analyze` and `melos run test` pass.

## Out of Scope
- Social login and the password-recovery cleanup (Task 81).
- Backend contract changes (the tasks listed under Depends on).
