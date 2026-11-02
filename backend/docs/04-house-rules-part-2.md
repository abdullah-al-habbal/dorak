---
nodeid: backend.04-house-rules.part-2
parentnode: backend.04-house-rules
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [04 — House Rules (The Business Laws)](04-house-rules.md) · [Previous](04-house-rules.md) · [Next](04-house-rules-part-3.md)

## E. Bookings (the no‑double‑booking law)

- **E1.** If two clients try to take the **same chair at the same time**, then **exactly one** succeeds and the other is told **"this seat was just taken."**
- **E2.** If a client books a chair + time slot, then that exact chair + slot is **locked** to them.
- **E3.** If a client prefers a specific Barber, then they may book **by the Barber** instead of by the chair.
- **E4.** If a booking is for an **at‑home** Barber, then it uses the **client's shared location**, not a floor plan.
- **E5.** If a Chair becomes **maintenance** after someone booked it, then those existing bookings must be **handled, not silently dropped** (see `08-edge-cases.md`).

---

## F. Reviews (two‑way trust)

- **F1.** If an appointment is **completed**, then **both sides may review**: client → shop, and shop → client.
- **F2.** If no appointment happened, then **no review** can be left for it.
- **F3.** If a client behaves badly, then the shop's review **protects other shops**; if a shop gives poor service, the client's review **protects other clients**.

---

## G. Jobs & hiring (simple, not an ATS)

- **G1.** If a Brand wants to post a job, then the **job board** feature must be turned on.
- **G2.** If a job is posted, then it is simply **open or closed** — for MVP there is **no paid‑vs‑unpaid** distinction.
- **G3.** If a Barber taps **Apply**, then a **snapshot of their profile** is sent to the shop's dashboard — nothing more complex.
- **G4.** If a shop **invites** a Barber, then the Barber must **accept or reject** before any affiliation becomes active.
- **G5.** If an invite is sent, then its state is **pending** until answered.

---

## H. Permissions & roles (RBAC)

- **H1.** A **Brand Owner** has full access to business settings, analytics, financial reports, every branch, and branch-manager accounts.
- **H2.** A **Branch Manager** can manage only daily operations, staff schedules, and bookings for their own branch.
- **H3.** A Branch Manager **cannot** open new branches, change brand billing, or touch other branches.
- **H4.** A **Barber** can manage **their own** profile, portfolio, and personal services, and respond to invites/jobs.
- **H5.** A **Client** can manage **their own** profile, bookings, and reviews.
- **H6.** A **Platform Admin** can manage tenants, currencies, exchange rates, and feature flags across the platform.
- **H7.** No role can ever see or change **another Brand's** data (multi‑tenant isolation).

---

## I. Feature gating (Freemium)

- **I1.** If a feature is **free** (micro‑site, hours, location, single‑chair discovery, basic booking), then **every** Brand has it.
- **I2.** If a feature is **premium** (multi‑branch, job board, and later the floor‑plan designer), then it works **only when its flag is on**.
- **I3.** If a Brand **downgrades** while holding multiple branches, then it must be handled gracefully — extra branches are **not destroyed** (see `08-edge-cases.md`).
- **I4.** If a user is a **freelance Barber**, then **salon‑only gates** (like multi‑branch) **do not apply to them** at all.
- **I5.** If a flag changes, then the change takes effect **the moment the next action is attempted** (flags are read at action time).

---
