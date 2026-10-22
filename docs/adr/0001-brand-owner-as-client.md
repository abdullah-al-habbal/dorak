# ADR 0001 — The brand owner is a client account with a dashboard capability

Status: `ACCEPTED` (Task 38, 2026-10-22)

## Context

The product specs define a Brand Owner who manages every branch, chair,
service, booking and report of their brand (house rules H1/H7, PRD §8.4,
user flow 4). The schema already links `brands.owner_id` to `clients`, brand
create/update run under `auth:client`, and the entity model says the owner
"signs up" and creates a brand. The dashboard, however, only knew the `admin`,
`branch` and `barber` actors, so no person could manage a whole brand.

Two models were considered:

1. **A new authenticatable** (`owners` table, `owner_api` guard).
2. **A client with an owner capability** that can open a dashboard session.

## Decision

**Option 2.** A brand owner is the client account referenced by
`brands.owner_id`. The capability is derived, not stored: a client may open an
`owner` dashboard session while it is enabled, email-verified, not banned and
owns at least one brand.

- `POST /api/v1/dashboard/login` accepts `actor_type = owner` and authenticates
  against `clients`. The Sanctum token is issued on the client with the
  `dashboard` ability; the claim carries `brand_id` and `brand_ids`.
- `DashboardAuthorizationMiddleware` accepts the `client` guard only for tokens
  with the `dashboard` ability, and rebuilds the owner's brand and branch scope
  on every request (`DashboardOwnerActorResolver`), so ownership changes apply
  immediately; refresh is refused once the client owns no brand.
- All dashboard scoping goes through `DashboardActor::scopedBranchIds()`,
  `scopedBrandIds()`, `canAccessBranch()` and `canManageBrand()`: admin is
  unrestricted, a branch manager is limited to its branch, a brand owner to the
  branches of its brands.

## Rationale

- No migration or data duplication: `brands.owner_id → clients` is already the
  source of truth, and one person keeps one login across the client app and the
  dashboard.
- A second credential store would need its own registration, verification,
  password reset and ban handling, all of which clients already have.
- Deriving the capability from ownership avoids a role flag drifting out of
  sync with `brands.owner_id`.

## Consequences

- Client mobile tokens (`client-active` / `email-verification` abilities) never
  pass the dashboard middleware; the owner's dashboard token can reach client
  routes, which is the same person.
- The dashboard notification bell is hidden for owners: the client inbox holds
  personal notifications, not brand operations.
- Branch managers remain separate branch accounts (Task 12); linking a manager
  person to a branch is out of scope.
