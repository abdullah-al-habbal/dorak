---
nodeid: backend.01-vision-and-scope.part-3
parentnode: backend.01-vision-and-scope
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [01 — Vision & Scope](01-vision-and-scope.md) · [Previous](01-vision-and-scope-part-2.md)

## 6. Explicitly deprioritized (🔭 Later)

Raised during research, **intentionally postponed** so the MVP ships. We revisit these *after* the core engine is live, partly because connectivity in Syria is improving:

- **Offline‑first** dashboard behavior.
- **Map provider localization** (OSM/Mapbox vs others) — use the simplest workable option for now.
- **SMS / WhatsApp gateway engineering** for reminders — keep notifications minimal for MVP.
- **Advanced analytics**, complex shifts, and lead‑generation billing experiments.

> These are not rejected — they are sequenced. Recording them here prevents them from quietly creeping into MVP.

---

## 7. Monetization stance (summary)

Subscription resistance is real for small owners, so the model is a **Freemium Feature Gate**, enforced through **feature flags**:

- **Free:** micro‑site, basic hours, location, single‑chair discovery, basic booking.
- **Premium:** **multi‑branch management**, **job board posting**, and (Phase 3) the **custom floor‑plan designer**.

Freelance barbers must **not** be able to reach salon‑only multi‑branch gates. Detail in `02-prd.md` → Monetization & Feature Flags.

---

## 8. Success metrics (MVP)

- **Supply:** number of branches onboarded; % that complete a floor plan with ≥1 seat.
- **Activation:** % of branches with hours + ≥1 service + ≥1 seat within 7 days.
- **Demand:** weekly active clients; searches → branch views → bookings (the funnel).
- **Core value proof:** completed bookings per active branch per week.
- **Trust loop:** % of completed appointments that receive a two‑way review.
- **Retention:** branch retention at 30 / 60 / 90 days.

---

## 9. Context & constraints

- **Geography:** Syria. Transport cost makes *proximity* a top‑ranked discovery signal.
- **Economy:** currency volatility ⇒ prices live in a chosen **base currency** with **on‑the‑fly exchange**, never hard‑coded amounts.
- **Language:** Arabic‑first audience; full **Arabic + English** throughout, with sensible fallback when a translation is missing.
- **Identity:** the product owner (Abdullah) works in mixed Arabic/English; documentation here is **English**, content/data is **bilingual**.
