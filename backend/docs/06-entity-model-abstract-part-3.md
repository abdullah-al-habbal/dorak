---
codeanchors:
  - backend/modules/
---

Part 3 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-2.md) · [Next](06-entity-model-abstract-part-4.md)

### Tenant core

**Brand** *(the tenant)*
- identifier
- **link**: Owner (a Client)
- name (**translatable**), logo_url, description (translatable)
- **link**: base Currency
- **feature flags** (e.g., multi‑branch, job board, floor‑plan designer — on/off)
- a **Settings** record
- **always owns ≥ 1 Branch**

**Branch** *(a physical location)*
- identifier
- **link**: Brand (deleting the Brand deletes its Branches)
- name (**translatable**), description (translatable)
- **link**: Manager (a Client), optional
- **gender category**: men‑only / women‑only / unisex
- coordinates (latitude/longitude) + address (translatable)
- opening/closing hours
- a **Settings** record (branch‑level overrides)
- owns **Chairs**

**Settings** *(attaches to many owners)*
- identifier
- **owner link (polymorphic)**: a Brand, Branch, Barber, **or** Client
- preferences: preferred Language, notification choices, display Currency, theme/universe, **price‑display mode** (single vs. dual currency)
> One human/shop‑level bag of preferences, reused across entity types — see [§4 Polymorphic links](06-entity-model-abstract-part-7.md#4-the-two-polymorphic-links-the-heart-of-flexibility).

---

### People

**Barber / Stylist** *(standalone)*
- identifier
- **link**: User
- name (**translatable**), bio (translatable), portfolio (photos)
- **is‑freelancer** (flag)
- travel radius (for at‑home), optional
- rating (derived from reviews)
- a **Settings** record
- owns their **own Services**
- has **Affiliations** (to brands/branches), zero or many
> Independent: leaving a shop ends only the **Affiliation**, never the Barber.

**Client / Customer**
- identifier
- **link**: User
- name, preferred **Universe**
- saved/last location, optional
- rating (derived from shop→client reviews)
- a **Settings** record
- has **Bookings** and **Reviews**
