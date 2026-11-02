# Dorak Website — Product Documentation
This folder is the **single source of truth** for the *Dorak Public Website* (Blade/Tailwind) before any code is written. It contains **no code** — only product requirements, UI/UX laws, and content architecture.

---

## Reading Order
| # | File | Purpose | Audience |
|---|---|---|---|
| — | [`README.md`](./README.md) | This index | Everyone |
| 01 | [`01-vision-and-scope.md`](./01-vision-and-scope.md) | Vision, problem, MVP boundary | Everyone |
| 02 | [`02-prd.md`](./02-prd.md) | **Master document.** Goals, scope, decisions | Product, Eng |
| 03 | [`03-persona-journeys.md`](./03-persona-journeys.md) | Visitor journeys (Owner, Client, Barber) | Product, Design |
| 04 | [`04-house-rules.md`](./04-house-rules.md) | The unshakeable UI/UX and theming laws | Everyone |
| 05 | [`05-domain-glossary.md`](./05-domain-glossary.md) | The bounded vocabulary | Everyone |
| 06 | [`06-content-and-ui-model-abstract.md`](./06-content-and-ui-model-abstract.md) | Marketing content entities (Abstract) | Eng |
| 07 | [`07-user-flows.md`](./07-user-flows.md) | Step-by-step visitor flows | Eng, Design |
| 08 | [`08-edge-cases.md`](./08-edge-cases.md) | Hard situations (SEO vs JS, missing translations) | Eng, QA |
| 09 | [`09-c4-context.md`](./09-c4-context.md) | C4 Level 1 — The site as one box | Eng |
| 10 | [`10-c4-containers.md`](./10-c4-containers.md) | C4 Level 2 — Blade, Tailwind, Alpine | Eng |
| 11 | [`11-frontend-architecture.md`](./11-frontend-architecture.md) | Component structure & CSS variable theming | Eng |

---

## Core Principles (The Website Invariants)
1. **Zero Discrimination Theming:** The base design is premium and neutral. The "Universe" toggle only changes accent colors and imagery, never the core layout.
2. **Backend-Driven Content:** No marketing text is hardcoded in Blade. All features, pricing, and testimonials are fetched dynamically from the Laravel API.
3. **SEO-First Rendering:** Critical marketing content must be server-side rendered in the initial HTML payload for search engines, while interactive elements (like the floor plan demo) use Alpine.js.

---

## AI Agent Instructions
AI coding agents must read these files before generating Blade or Tailwind code. Pay special attention to `04-house-rules.md` to ensure the "No Discrimination" theming law is strictly followed via CSS variables.
