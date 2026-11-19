---
nodeid: backend.08-edge-cases
parentnode: backend.docs
childnodes:
  - backend.08-edge-cases.part-2
  - backend.08-edge-cases.part-3
codeanchors:
  - backend/modules/
---

# 08 — Edge Cases

> The hard situations. Each one states the **scenario**, the **desired behavior**, and whether it's ✅ decided or 🟡 open. Rules referenced as `[E1]` point to `04-house-rules.md`.

---

## Bookings & concurrency

### EC‑1 — Two clients tap the same green chair at once ✅
**Scenario:** Two people select the same chair + slot within the same instant.
**Behavior:** **Exactly one** booking succeeds; the other immediately sees **"this seat was just taken"** and returns to the floor plan `[E1]`. This is a **hard guarantee** (NFR in `02-prd.md` §9). *How* it's enforced is an engineering concern, not part of these docs.
**See also:** the engineering audit of this guarantee (lock order, the confirm-versus-create and reschedule-versus-create deadlocks, the retry and 503 gap) is in [booking concurrency](../../docs/booking-concurrency/01-lock-order-and-deadlocks.md).

### EC‑2 — Chair flips to maintenance after bookings exist ✅(policy)
**Scenario:** A chair already has future bookings, then is set to **maintenance**.
**Behavior:** Existing bookings must be **handled, not silently dropped** `[E5]`: notify affected clients and offer rebooking (another chair/barber/time). 🟡 *exact reaccommodation UX is open.*

### EC‑3 — No‑show or late cancellation ✅
**Scenario:** Client books but doesn't arrive, or cancels at the last minute.
**Behavior:** Booking moves to **no‑show / cancelled**; the slot frees up. Cancellation closes two hours before the appointment.

### EC‑4 — Booking "by barber" when that barber moves chairs ✅(principle)
**Scenario:** A client booked a specific **barber**, but the barber's station changes that day.
**Behavior:** The booking follows the **barber**, not the chair `[E3]`. The floor plan reflects the barber's actual station.

---

## Growth & lifecycle

### EC‑5 — Single shop becomes multi‑branch ✅
**Scenario:** A standalone shop opens a second location.
**Behavior:** Because of **Branch‑First**, this is just **add a Branch** under the same Brand — **no migration, no lost data, no lost reputation** `[A1–A4]`. This is the headache the whole invariant exists to prevent.

### EC‑6 — Premium downgrade while holding multiple branches ✅(policy)
**Scenario:** A brand on Premium (multi‑branch) downgrades to Free.
**Behavior:** Extra branches are **never destroyed** `[I3]`. They should be **suspended/read‑only** (still visible, not actively manageable) until the brand re‑upgrades. 🟡 *exact "locked" behavior to confirm.*

### EC‑7 — Deleting a Brand ✅
**Scenario:** A Brand is removed.
**Behavior:** Its **Branches and Chairs go with it** `[A6]`. **Barbers survive** — only their **affiliations** to that brand end `[C5]`. Independent barber data is never collateral damage.

---

## Continued in

- [Part 2: Standalone barbers & affiliations](08-edge-cases-part-2.md)
- [Part 3: Language](08-edge-cases-part-3.md)
