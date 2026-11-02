---
nodeid: backend.02-prd.part-3
parentnode: backend.02-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 8 · [02 — Product Requirements Document (PRD)](02-prd.md) · [Previous](02-prd-part-2.md) · [Next](02-prd-part-4.md)

## 5. Phasing

| Phase | Theme | Includes |
|---|---|---|
| **Phase 1 — Core Engine** ✅ | Make a shop real and bookable | Storefront, Branch‑First hierarchy, seats, geolocation discovery, visual floor plan, booking, standalone/at‑home barbers, bilingual, currency, double‑booking protection, roles |
| **Phase 2 — Trust & Talent** 🟢 | Build trust and the B2B loop | Two‑way reviews, simple job board, employee invitations |
| **Phase 3 — Power & Polish** 🟠 | Depth for serious operators | Advanced analytics, richer barber portfolios, owner‑editable floor‑plan designer |
| **Later** 🔭 | Resilience & growth bets | Offline mode, map localization, richer notifications, paid/unpaid jobs, complex shifts, payments |

---

## 6. Monetization & feature flags

**Model:** Freemium Feature Gate, enforced by per‑brand **feature flags** (a simple set of on/off switches, e.g. `multi_branch`, `job_board`, `floor_plan_designer`).

| Tier | Unlocks |
|---|---|
| **Free** | Micro‑site, basic hours, location, single‑chair discovery, basic booking |
| **Premium** | **Multi‑branch management**, **job‑board posting**, and (Phase 3) **custom floor‑plan designer** |

**Rules of the gate** (full list in `04-house-rules.md`):
- A free brand may hold **only one branch**; creating a second requires the `multi_branch` flag.
- Posting a job requires the `job_board` flag.
- **Freelance barbers cannot access salon‑only gates** (multi‑branch monetization is meaningless for an individual).
- Flags are **read at the moment of action**, so upgrades/downgrades take effect immediately.

---

## 7. Resolved decisions

These were open during brainstorming and are now **✅ decided**.

1. **Search targets Branches (plus freelancers), not Brands.** Clients need distance, seats, and booking for the **specific building** nearest them. The query matches branch + brand + tags, and **unions in freelance barbers** so independents are discoverable even without a fixed address.
2. **Branch‑First invariant.** No "shop without a branch." Growth = add a branch. This eliminates the single→multi‑branch migration entirely.
3. **Barber is a standalone entity** linked to brands/branches through a **flexible affiliation layer** (a barber may affiliate with *many* shops, or none). Leaving a shop never deletes the barber's own data.
4. **Services are owned by either a brand or a barber** (so freelancers have menus too), with an **at‑home** option.
5. **Backend‑driven visual floor plan.** The backend describes the layout; the app draws it. Green = free now; tap → barber + services → book.
6. **Two universes with a gender category** on every branch; unisex appears in both.
7. **Currency engine, not hard‑coded prices.** Base currency + exchange layer + optional dual display.
8. **Double‑booking is structurally impossible** (see NFR §9).
9. **Each Brand, Branch, Barber, and Client owns a Settings record** (language, notifications, display currency, theme/universe, price‑display mode).

---

## 8. Locked implementation decisions ✅

1. **At-home checkout:** require a GPS map pin (`latitude`/`longitude`) plus street, building, and unit/apartment text.
2. **Unisex floor management:** use one unified floor plan with designated men's and women's zones.
3. **Floor-plan designer:** MVP uses standard form inputs/presets; interactive drag-and-drop is deferred to Phase 3.
4. **RBAC:** Brand Owners have full business settings, analytics, financial reports, all branches, and branch-manager-account access. Branch Managers are limited to daily operations, staff schedules, and bookings for their own branch.
5. **Chair availability:** MVP is scheduled-booking-only; do not build real-time socket or hardware occupancy tracking.
6. **Booking and cancellation:** slots are derived from total service duration; cancellation closes two hours before the appointment.
7. **Reviews and disputes:** reviews require `Completed` status. A flagged dispute holds publication for a 48-hour admin review.
8. **Barber identity:** managers may add a barber with name and phone without an app account; one phone number may hold both Client and Barber profiles.

---
