---
codeanchors:
  - backend/modules/
---

# 02 — Product Requirements Document (PRD)

> **This is the master document.** All other files support and expand it.
> Product: **Dorak** (placeholder name — see `01-vision-and-scope.md`).
> Scope of this PRD: the **MVP** plus the immediate phases, with decisions frozen and open questions flagged.

---

## 1. Product summary

Dorak is a **multi‑tenant SaaS platform** for the Syrian grooming and beauty industry. It gives **owners** an operational management engine (storefront, seats, hours, staff, jobs) and gives **clients** a **visual, location‑aware discovery and booking** experience across two universes — **Men's Grooming** and **Women's Beauty**. Independent **barbers/stylists** are first‑class and can operate freelance (including **at‑home**) or affiliate with shops.

The product is anchored on four invariants — **Branch‑First, Barber‑Standalone, Backend‑Driven UI, Two Universes** — defined in `01-vision-and-scope.md`.

---

## 2. Goals & non‑goals

### Goals (MVP)
1. Let any shop create a **branch storefront** (profile, hours, location, services, prices) in minutes.
2. Let clients **discover the nearest** relevant shops and **book against a visual floor plan**.
3. Make **growth painless**: one shop → many branches with zero data migration (Branch‑First).
4. Treat **barbers as independent**: freelance, at‑home, and/or affiliated with shops.
5. Support **bilingual** content and **multi‑currency** pricing under volatile exchange rates.
6. **Never** allow a chair/time‑slot to be double‑booked.

### Non‑goals (now) 🔭
- Offline‑first behavior, map‑provider localization, SMS/WhatsApp gateway engineering.
- Advanced analytics, complex shift scheduling, paid‑vs‑unpaid job mechanics, commission/payment processing.
- A full applicant‑tracking system (ATS) or LinkedIn‑style network.
- In‑app payments / wallet (booking is a *reservation*, not a transaction, for MVP).

---

## Continued in

- [Part 2: 3. User types (personas)](02-prd-part-2.md)
- [Part 3: 5. Phasing](02-prd-part-3.md)
- [Part 4: 9. Non‑functional requirements (NFRs)](02-prd-part-4.md)
- [Part 5: 12. Client Intelligence Engine](02-prd-part-5.md)
- [Part 6: 12.4 Domain Model — New Entities](02-prd-part-6.md)
- [Part 7: Interaction Tracking & Favorites](02-prd-part-7.md)
- [Part 8: 12.7 Extended House Rules](02-prd-part-8.md)
