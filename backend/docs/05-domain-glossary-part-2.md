---
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [05 — Domain Glossary (The Bounded Vocabulary)](05-domain-glossary.md) · [Previous](05-domain-glossary.md)

## Product controls

- **Feature flag** (مفتاح الميزة) — A simple **on/off switch** per Brand that unlocks a premium capability (e.g., `multi_branch`, `job_board`, `floor_plan_designer`).
- **Freemium gate** — The monetization model: a generous **free** tier plus **premium** capabilities unlocked by flags.
- **Settings** (الإعدادات) — A preferences record owned by a Brand, Branch, Barber, **and** Client (language, notifications, display currency, theme/universe, price‑display mode).
- **Job** (الوظيفة / فرصة عمل) — A simple role a Branch posts: **open** or **closed**. (Paid‑vs‑unpaid is **out** for MVP.)

## Audience & language

- **Universe** — One of the two consumer worlds: **Men's Grooming** or **Women's Beauty**. Chosen on first launch; sets theme and default discovery filter.
- **Gender category** (التصنيف) — A Branch attribute: **men‑only**, **women‑only**, or **unisex**. Drives which universe(s) the branch appears in; **unisex appears in both**.
- **Bilingual / translatable** — Content stored and shown in **Arabic + English**, with fallback to the other language when one is missing.
- **Fallback** — Showing the available language when the requested one is missing, so a label is **never empty**.

## Discovery

- **Proximity / Geolocation discovery** — Ranking shops by **how near** they are to the client, because transport cost makes nearness a top signal.
- **Search** — The home‑screen lookup. Targets **Branches first** (matching branch + brand + tags) and **also surfaces freelance Barbers**, since a client visits a *building* but may also want an independent who has no fixed address.

## SaaS terms

- **Multi‑tenant** — Many Brands share one platform while their data stays **fully isolated**.
- **MVP** — The smallest version that delivers the core value (see `01-vision-and-scope.md`, `02-prd.md`).
- **Phase 1 / 2 / 3 / Later** — The build sequence (see `02-prd.md` §5).
