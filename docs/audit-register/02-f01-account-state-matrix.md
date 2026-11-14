# 02 F-01 account state versus write access (trace, not executed)

> Everything below is a static trace. **T-02** ([10](10-prerequisites-t01-t04.md)) requires runtime verification of each scenario before its fix, and **T-03**
> requires tracing the shared mobile paths (section 4).

## Correction to the first audit
Bans and owners are enforced better than first reported:
- `EnsureNotBanned` is appended to the whole `api` group (`bootstrap/app.php:24`): banned clients and barbers get 403 on every
  request. It checks only the `client` and `barber` guards, so **a branch (manager) account is never ban-checked** even though
  `BannableTypeEnum` includes Branch and `BranchModel::bans()` exists. Admin ban endpoints exist only for barbers and clients.
- `DashboardOwnerActorResolver::forClient` re-checks status Enabled, verified email, not trashed and at least one brand on every request.
- Admins are re-checked every request (`isActive`).

## 1. Per-request enforcement by actor
| Actor | Checked every request | Not checked |
|---|---|---|
| Admin | `isActive` | nothing |
| Owner (`ClientModel`) | ban; status, verified, not deleted, has a brand | brand status (Suspended, Pending, Rejected) |
| Manager (`BranchModel`) | nothing | branch status, brand status, bans |
| Barber | ban | status Disabled, Rejected, Pending |

## 2. Existing sessions after a status change
| Event | Access tokens | Refresh tokens | Next dashboard request |
|---|---|---|---|
| Admin deactivated | deleted (`AdminUserService::deactivate`) | rotation refused (`activeAdminActor`; test `DashboardAuthApiTest.php:207`) | 401 |
| Client or barber banned | deleted (`BanObserver`, client and barber only) | kept | banned: 403 |
| Barber deactivated | kept | kept, renewable | reads continue |
| Branch Suspended or Disabled | kept | kept | everything continues |
| Brand Suspended | kept | kept | everything continues |

No lifecycle service revokes sessions: `BranchLifecycleService::change`, `BrandReviewService::suspend` and
`BarberActivationService::deactivate` only update status, log and email.

## 3. The 50 tenant-reachable write routes
Nine are self-account or session routes (logout, notifications, profile, password, settings, email change and verify): these
stay allowed. The other **41 are operational**.

### 3a. Blocked for a Suspended brand today (7)
`POST /bookings/walk-in`, `POST /branches`, `POST /branches/{branch}/affiliations`, `PUT /brands/{brand}`
(`UpdateBrandAction.php:25` `ensureNotSuspended`), `POST /stylists`, `PATCH /branches/{branch}/switch-on`,
`PATCH /branches/{branch}/switch-off`.

### 3b. Only Pending is blocked; Suspended passes (5)
Affiliation accept, reject, terminate; job-posting store and update (`BrandStaffingGuard` checks Pending only).

### 3c. No brand or branch state guard at all (29)
| Group | Routes |
|---|---|
| Branch | `PUT /branches/{branch}`, `DELETE /branches/{branch}` |
| Chairs and floor plan | `POST /chairs`, `PUT /chairs/{chair}`, `DELETE /chairs/{chair}`, `PATCH /branches/{branch}/floor-plan` |
| Services | `POST /services`, `PUT /services/{service}`, `DELETE /services/{service}`, `POST /service-categories` |
| Stylists | `PUT /stylists/{stylist}`, `DELETE /stylists/{stylist}`, `PATCH /stylists/{stylist}/activate`, `PATCH /stylists/{stylist}/deactivate` |
| Hours | `PUT /branches/{branch}/opening-hours`, `PUT` and `DELETE /branches/{branch}/hours-overrides/{date}` |
| Bookings | `PATCH /bookings/{booking}`, `PATCH /bookings/{booking}/cancel`, `PATCH /bookings/{booking}/reschedule`, `POST /bookings/{booking}/review` |
| Staffing | `DELETE /branches/{branch}/job-postings/{jobPosting}`, applications `mark-seen`, applications `{application}/status`, `POST /branches/{branch}/reviews/{review}/dispute` |
| Brand level | `POST /brands`, `POST /brands/{brand}/resubmit`, `PUT` and `DELETE /barbers/{barber}/services/{service}/override` |

Walk-in is blocked for a Suspended brand but not for a Suspended or Disabled branch of an active brand: the Booking module has
no branch status check at all (searched).
Barbers have no operational write on the dashboard (only GET schedule and earnings), so barber impact is read access
after deactivation, which decision A preserves.

## 4. Mobile coupling
`EnsureBranchAccountAccess` (`BranchModel::isOperational()` = status Enabled AND brand Active, 403 `ACCOUNT_NOT_ACTIVE`) and
`EnsureBarberAccountAccess` protect mobile routes fully. `Dashboard/Routes/Api/V1/mobile.php` reuses the dashboard service
CRUD and earnings actions behind those middleware. A guard added inside a shared action also runs on mobile paths: safe only
because mobile is blocked earlier, and it must be regression-tested.

## 5. Sub-findings
- **F-01a** 29 routes fully open plus 5 partly for a suspended brand or branch. Confirmed by trace. Medium. No test covers them
  (`DashboardInvitationsTest.php:225-237` and `DashboardBrandLifecycleTest` cover only guarded routes).
- **F-01b** Manager accounts have no lifecycle check at login (`DashboardLoginHandler::authenticateBranch`, password only),
  per request (`DashboardAuthorizationMiddleware::branchActor`) or on refresh (`DashboardRefreshTokenResolver::actorFromRecord`).
  Enabler for F-01a. Medium.
- **F-01c** Refresh re-validates only admins. A Disabled barber renews every 30 days (reads only); a banned user gets a token
  that is then 403 everywhere; a deleted branch probably hits a 404 instead of 401 (unverified). Tests: only the deactivated admin.
  Low.
- **F-01d** Intentional, backed by decisions: reads stay open for a suspended brand (D8: sign in, banner, nothing new);
  a branch prepared while pending is allowed (D9); platform admin bypasses brand guards.

## 6. Ambiguities inside decision A (need confirmation, A itself is not reopened)
1. A versus D9: Disabled and Pending are normal setup states for a branch the owner configures before switching on.
   Recommended: A applies to Suspended brands and branches, not Disabled or Pending.
2. Existing future bookings under suspension (D8). Recommended: cancel allowed, everything else operational blocked.
3. Self-account and session writes always allowed. Recommended: yes.
4. `POST /brands` and `resubmit` for the owner of a suspended brand. Recommended: allow; `resubmit` needs its own review.
5. Walk-in on a Suspended or Disabled branch. Recommended: block both.
6. A Disabled barber refreshing a session (login already denies non-Enabled). Recommended: deny.

## 7. Reproduction scenarios (described, not executed)
1. Active brand with a manager; admin suspends the brand; manager calls `POST /dashboard/chairs` with the existing token.
   Today 201, expected 403.
2. Branch Suspended by the owner or admin; manager logs in and edits services. Today allowed.
3. Barber deactivated by an admin; barber calls `POST /dashboard/refresh` with the old refresh token. Today a new token.
4. Branch row soft-deleted; manager refresh. Today probably 404 not 401 (unverified).
