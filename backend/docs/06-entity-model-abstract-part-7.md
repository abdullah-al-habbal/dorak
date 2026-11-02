---
nodeid: backend.06-entity-model-abstract.part-7
parentnode: backend.06-entity-model-abstract
childnodes: []
codeanchors:
  - backend/modules/
---

Part 7 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-6.md) · [Next](06-entity-model-abstract-part-8.md)

## 4. The two polymorphic links (the heart of flexibility)

Two relationships intentionally point at **more than one kind of entity**. This is what makes the model flexible without duplication.

### 4.1 Barber Affiliation → Brand **or** Branch
A Barber's affiliation can attach to a **whole Brand** (works across all its branches) **or** a **specific Branch** (locked to one location). The affiliation simply records *which kind* it points to plus its id. This is why:
- a Barber can serve **many** shops at once,
- a freelancer can serve **none**, and
- leaving a shop ends only the **link**, never the Barber.

### 4.2 Service → Brand **or** Barber
A Service can be owned by a **Brand** (the shop's menu) **or** by a **Barber** (a freelancer's personal menu). Same shape, two owners. This is why an independent, at‑home barber can have a full price list without belonging to any salon.

> Two more "shared shapes" use the same idea for convenience: **Settings** attaches to a Brand/Branch/Barber/Client, and a **Review's** author/subject can be a Client *or* a shop (two‑way reviews).

---

## 5. What this model deliberately avoids (for now)

- **No payment/wallet entities** — bookings are reservations for MVP.
- **No shift/roster entities** — complex scheduling is 🔭 Later.
- **No paid/unpaid job mechanics** — jobs are just open/closed.
- **No analytics tables** — derived metrics come later.
- **No commitment to stored vs. computed Floor Plans** — left to implementation.

These omissions are intentional: the model stays small enough to ship and flexible enough to grow.

---

## 6. Client Intelligence Entities (new — 15 entities, 5 modules)

> Migrated from `prd.md` §5. Naming Convention: every entity uses PascalCase, ends with `Model`, and uses `HasUuids`. Translatable fields use `Spatie\Translatable\HasTranslations`. Full migration schemas in `11-backend-architecture.md` §5.8.
