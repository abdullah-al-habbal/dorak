---
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [01 — Vision & Scope](01-vision-and-scope.md) · [Previous](01-vision-and-scope.md) · [Next](01-vision-and-scope-part-3.md)

## 4. The four invariants (non‑negotiable design principles)

These are the spine of the whole product. Detailed consequences live in `06-entity-model-abstract.md` and `04-house-rules.md`.

### 4.1 Branch‑First
Even a single neighborhood shop is stored as a **Brand that owns exactly one Branch**. There is no such thing as a "shop with no branch."

- **Why:** when an owner opens their second location, it is simply **a new Branch under the same Brand** — *no data migration, no lost history, no lost reputation.* The "simple salon → multi‑branch salon" transition is therefore a non‑event.

### 4.2 Barber is standalone
A barber/stylist is an **independent entity**, never merely a row inside a salon.

- A barber can be a **freelancer**, including **at‑home** service (they travel to the client).
- A barber can be **affiliated** to **one or many** brands/branches through a flexible link layer, and can leave without their personal profile, portfolio, or services being destroyed.

### 4.3 Backend‑driven UI
The signature experience — a **top‑down visual floor plan** with abstract shapes and **clickable chairs (green = free right now)** — is **described by the backend** and merely *rendered* by the client app. Tapping a free chair reveals the assigned barber (if any) and their services, then opens booking.

- **Why:** consistent, maintainable, and centrally controllable look across thousands of shops, without bespoke front‑end work per shop.

### 4.4 Two universes
Men's Grooming and Women's Beauty are first‑class, with unisex bridging both (see §3).

---

## 5. Scope — what is in, next, later

This is the MVP boundary. Phased detail lives in `02-prd.md`.

### ✅ MUST HAVE — the Core Engine (MVP)
- **Micro‑site / digital storefront** per branch: profile, hours, location, services, prices.
- **Branch‑First hierarchy:** Brand → Branch → Chair/Seat, with seats defined.
- **Geolocation discovery:** client home feed shows the **nearest** shops; search prioritizes branches.
- **Visual shop floor + booking:** interactive chairs, live availability, tap‑to‑book.
- **Standalone barbers** with their own profile and services, including basic **at‑home** capability.
- **Bilingual** content (Arabic + English) and **multi‑currency** pricing (e.g., SYP, USD) with exchange handling.
- **Double‑booking protection** (a chair/slot can never be taken twice).
- **Roles:** Brand Owner, Branch Manager, Barber, Client (+ Platform Admin).

### 🟢 SHOULD HAVE — the Differentiators (early Phase 2)
- **Two‑way reviews** (client ↔ shop).
- **Simple job board** (post a role; "Apply" routes a profile to the owner — *not* an ATS).
- **Employee invitations** (shop invites a barber to affiliate; barber accepts/rejects).

### 🟠 COULD HAVE — Phase 3
- Advanced analytics panels for owners.
- Richer B2B portfolios for barbers.
- **Owner‑editable** visual floor‑plan designer (drag chairs) inside the admin panel.

### 🔴 WON'T HAVE — at launch
- Paid‑vs‑unpaid job distinction (jobs are simply open/closed for MVP).
- Complex staff shift scheduling.

---
