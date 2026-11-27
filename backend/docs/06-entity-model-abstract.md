---
codeanchors:
  - backend/modules/
---

# 06 — Entity Model (Abstract)

> **No database schema, no SQL, no real ERD.** Entities are described as **plain‑English objects with attributes**, followed by an **abstract relationship view**. This is the *vocabulary of things*, deliberately kept above implementation so nothing gets locked in too early.
> Definitions for each term: `05-domain-glossary.md`. Behavior: `04-house-rules.md`.

How to read an attribute's *nature* (plain words, not code):
- **identifier** — a stable, non‑guessable id (suitable for public links).
- **translatable** — held in **both Arabic and English**, with fallback.
- **flag** — a simple yes/no.
- **status** — one value from a short fixed list.
- **link** — points to another entity.
- **money / rate / coordinates / timestamps** — exactly what they sound like.

---

## 1. Build priority order (which entities to model first)

Build bottom‑up: foundations first, then the things that depend on them. Feature flags ride on **Brand** from the start but are *enforced* progressively.

| Tier | Entities | Why first |
|---|---|---|
| **0 — Foundations** | **Client**, **Language**, **Currency**, **Exchange Rate** | Identity, bilingual content, and money must exist before anything is priced or owned. |
| **1 — Tenant core** | **Brand**, **Branch**, **Settings** | The Branch‑First spine. A Brand is meaningless without its first Branch. Settings attach to many things, so define early. |
| **2 — People** | **Barber**, **Client**, **Barber Affiliation** | Barber is standalone; the affiliation link connects barbers to brands/branches. |
| **3 — Catalog** | **Service** | Owned by a Brand *or* a Barber; needs Currency (Tier 0) to be priced. |
| **4 — Physical & UI** | **Chair / Seat**, **Floor Plan (view)** | Chairs belong to a Branch and anchor the visual floor plan. |
| **5 — Transactions** | **Booking** | The core action; depends on Chairs/Barbers/Services. Carries the no‑double‑booking guarantee. |
| **6 — Trust & talent** | **Review**, **Job**, **Job Application** | Built on completed bookings (reviews) and on branches/barbers (jobs). |
| **7 — Later** 🔭 | **Notification** | Kept minimal for MVP. |

---

## Continued in

- [Part 2: 2. The entities (plain‑English objects)](06-entity-model-abstract-part-2.md)
- [Part 3: Tenant core](06-entity-model-abstract-part-3.md)
- [Part 4: Catalog](06-entity-model-abstract-part-4.md)
- [Part 5: Trust & talent](06-entity-model-abstract-part-5.md)
- [Part 6: 3. Abstract relationship view](06-entity-model-abstract-part-6.md)
- [Part 7: 4. The two polymorphic links (the heart of flexibility)](06-entity-model-abstract-part-7.md)
- [Part 8: 6.1 Service Catalog & Taxonomy](06-entity-model-abstract-part-8.md)
- [Part 9: 6.2 Client Service History](06-entity-model-abstract-part-9.md)
- [Part 10: 6.4 Discovery Preferences & Interaction Tracking](06-entity-model-abstract-part-10.md)
- [Part 11: 6.5 Recommendation Engine](06-entity-model-abstract-part-11.md)
- [Part 12: 7. Client Intelligence Relationship Diagram](06-entity-model-abstract-part-12.md)
- [Part 13: 8. Naming Reference (Client Intelligence)](06-entity-model-abstract-part-13.md)
