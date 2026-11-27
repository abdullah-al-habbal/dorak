---
codeanchors:
  - backend/modules/
---

Part 4 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-3.md) · [Next](06-entity-model-abstract-part-5.md)

**Barber Affiliation** *(the flexible link)*
- identifier
- **link**: Barber
- **affiliable link (polymorphic)**: a **Brand** *or* a **Branch**
- **status**: pending / active / terminated
- optional: commission rate (a future SaaS extra)
- timestamps (invited, accepted/ended)
> Lets one Barber belong to **many** shops at once, at either the brand or branch level.

---

### Catalog

**Service**
- identifier
- **owner link (polymorphic)**: a **Brand** *or* a **Barber**
- name (**translatable**), description (translatable)
- price (**money**) + **link**: Currency
- duration, optional
- **at‑home** (flag)
- active (flag)

---

### Physical & UI

**Chair / Seat**
- identifier
- **link**: Branch
- **link**: Barber, optional (the station's current/assigned barber)
- **UI metadata**: shape + position on the floor plan; interactive or decorative
- **status**: available / occupied / maintenance
- label/number, optional

**Floor Plan** *(a derived view, not necessarily a stored thing)*
- canvas size (width/height/unit)
- a list of **components**: each is a Chair (interactive, colored by status, may carry the linked barber) or a static decoration (waiting area, mirror, etc.)
> This is **assembled by the backend** from a Branch's Chairs + UI metadata and **drawn by the app** (Backend‑Driven UI). Whether any of it is persisted vs. computed on request is an implementation choice, left open.

---

### Transactions

**Booking / Reservation**
- identifier
- **link**: Client
- **link**: Chair, optional *(empty for at‑home)*
- **link**: Barber, optional *(set when booked "by barber" or at‑home)*
- **link**: Service(s)
- **time slot**
- **status**: booked / completed / cancelled / no‑show
- at-home location: required latitude/longitude plus street, building, and unit/apartment text
- time slot: derived from the total selected-service duration; cancellation closes two hours before the appointment
- timestamps
> **Hard rule:** the same **Chair + time slot** can never be held twice — exactly one wins (`04-house-rules.md` E1; NFR in `02-prd.md` §9).

---
