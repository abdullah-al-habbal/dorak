---
nodeid: backend.08-edge-cases.part-2
parentnode: backend.08-edge-cases
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [08 — Edge Cases](08-edge-cases.md) · [Previous](08-edge-cases.md) · [Next](08-edge-cases-part-3.md)

## Standalone barbers & affiliations

### EC‑8 — Barber affiliated with several shops at once ✅
**Scenario:** A popular barber works for two brands and freelances at home.
**Behavior:** Multiple **active affiliations** coexist `[C4]`, plus independent at‑home work. Each affiliation is its own link with its own status.

### EC‑9 — Schedule conflict across affiliations 🟡
**Scenario:** The same barber is double‑booked across **two different shops** (or a shop + at‑home) for overlapping times.
**Behavior:** The system should prevent a barber from being committed to two places at once. 🟡 *whether MVP enforces a unified barber calendar across affiliations, or treats each shop's calendar separately, is an Open Decision (relates to `02-prd.md` §8 #5).*

### EC‑10 — Barber leaves a shop ✅
**Scenario:** An affiliation is **terminated**.
**Behavior:** The barber's **profile, portfolio, and personal services stay** `[C5]`; the chair they used becomes **unassigned**; their future shop bookings are handled like EC‑2. The barber keeps freelancing if they wish.

### EC‑11 — Freelancer with no fixed location in search ✅
**Scenario:** An at‑home‑only barber has no building/coordinates.
**Behavior:** They still appear in **search** by name/service (the unified search surfaces freelancers), and booking uses the **client's** location, not the barber's `[E4]`. They simply don't anchor to the proximity map the way branches do.

---

## Universes & unisex

### EC‑12 — Unisex shop and the universe filter ✅
**Scenario:** A unisex salon should reach both audiences.
**Behavior:** It appears in **both** the Men's Grooming and Women's Beauty universes `[J5]`.

### EC‑13 — Separate men's/women's sections in one unisex shop ✅
**Scenario:** A unisex shop physically has distinct men's and women's areas.
**Behavior:** One unified floor plan represents the sections as designated zones.

---

## Money

### EC‑14 — Exchange rate changes between viewing and paying ✅(principle)
**Scenario:** A client sees a converted price, then books moments later after the rate moved.
**Behavior:** Prices are **computed on the fly from the current rate** `[D4]`; the displayed converted value is **indicative**. The **base‑currency price is the source of truth**. 🟡 *whether to "freeze" a quoted rate at booking time is a future refinement.*

### EC‑15 — Missing exchange rate for a currency pair ✅(policy)
**Scenario:** No rate exists to convert into the client's display currency.
**Behavior:** Fall back to showing the **base‑currency price** (never show a wrong or blank price).

---
