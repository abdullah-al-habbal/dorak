---
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [08 — Edge Cases](08-edge-cases.md) · [Previous](08-edge-cases-part-2.md)

## Language

### EC‑16 — Missing translation for a name/description ✅
**Scenario:** A shop filled Arabic but not English (or vice‑versa).
**Behavior:** Show the **available language as fallback** `[J2]` — a label is **never empty**.

---

## Chairs, jobs, and reviews

### EC‑17 — Branch with zero chairs ✅
**Scenario:** A storefront exists but no chairs are defined yet.
**Behavior:** The branch is **visible** but **not chair‑bookable** `[B6]` (an at‑home affiliated barber could still be booked by barber/location).

### EC‑18 — Reviewing without a completed appointment ✅
**Scenario:** Someone tries to review a shop they never actually visited.
**Behavior:** **Not allowed** — reviews require a **completed** booking `[F2]`.

### EC‑19 — Duplicate or similar brand/branch names ✅(principle)
**Scenario:** Several "Royal Barber" branches exist across cities.
**Behavior:** Search matches **branch + brand + tags** and ranks by **proximity**, so the client distinguishes by **distance and details**, not by name alone `[search]`.

### EC‑20 — Job posted on a branch that later closes/deletes 🟡
**Scenario:** A job's branch is removed while the job is open.
**Behavior:** Open jobs for a removed branch should be **closed automatically**; existing applications remain visible to the owner. 🟡 *confirm desired handling.*

---

## Identity

### EC‑21 — One person is both a Client and a Barber ✅
**Scenario:** A barber also books appointments as a client elsewhere.
**Behavior:** One phone number may carry both profiles. Managers may also add a Barber by name and phone before that barber creates an app account.

---

## Summary of what's still open 🟡

EC‑6 (downgrade lock UX), EC‑9 (cross-affiliation calendar), EC‑14 (rate freezing), and EC‑20 (job on deleted branch) remain open. The cancellation, unisex-sectioning, and dual-profile identity rules are locked in `02-prd.md` §8.
