---
nodeid: backend.docs.part-2
parentnode: backend.docs
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [Dorak Backend — Product Documentation](README.md) · [Previous](README.md) · [Next](readme-part-3.md)

## Reading order

The documents move from **"What problem are we solving?"** → **"Who does what?"** → **"What are the laws?"** → **"How is the system shaped?"**

| # | File | Purpose | Audience |
|---|---|---|---|
| — | [`README.md`](./README.md) | This index | Everyone |
| 01 | [`01-vision-and-scope.md`](./01-vision-and-scope.md) | Vision, problem, MVP boundary, what we will **not** build now | Everyone |
| 02 | [`02-prd.md`](./02-prd.md) | **Master document.** Goals, scope, features, locked implementation decisions, metrics, risks | Product, Eng, Stakeholders |
| 03 | [`03-persona-journeys.md`](./03-persona-journeys.md) | Day‑in‑the‑life stories for each persona | Product, Design |
| 04 | [`04-house-rules.md`](./04-house-rules.md) | The unshakeable business laws as simple If / Then statements | Everyone |
| 05 | [`05-domain-glossary.md`](./05-domain-glossary.md) | The bounded vocabulary — one agreed meaning per term | Everyone |
| 06 | [`06-entity-model-abstract.md`](./06-entity-model-abstract.md) | Entities as plain‑English objects + abstract relationships + **build priority order** | Eng, Product |
| 07 | [`07-user-flows.md`](./07-user-flows.md) | Step‑by‑step interaction flows (diagrams) | Eng, Design |
| 08 | [`08-edge-cases.md`](./08-edge-cases.md) | The hard situations and how the product behaves | Eng, QA, Product |
| 09 | [`09-c4-context.md`](./09-c4-context.md) | C4 Level 1 — the system as one box and who/what touches it | Eng, Stakeholders |
| 10 | [`10-c4-containers.md`](./10-c4-containers.md) | C4 Level 2 — the major moving parts inside the system | Eng |
| 11 | [`11-backend-architecture.md`](./11-backend-architecture.md) | C4 Level 3 — module layout + the **Action → Handler → EloquentResolver** pattern + coding conventions + Architecture-Aligned PRD (v2.0) | Eng |
| — | [`05-recommendation-prd.md`](./05-recommendation-prd.md) | Phase 5 Recommendation Module — data model, architecture, ranking formula, nightly batch, filters, test plan | Eng |
| — | [`feature-index.md`](./feature-index.md) | **Chronological map of built features** — append after each new feature | AI Agents |
| — | [`marketing/`](./marketing) | Marketing strategy & brand docs (Arabic/English) | Marketing, Product, Stakeholders |

The **PRD (02)** is the master. Everything else supports and expands it.

> **Beyond the spec:** the executable wrapper around these docs lives in `../.claude/skills/` (the Laravel baseline skills). See `.claude/skills/README.md`.

---

## Core principles (the four invariants)

These appear throughout the docs. If you read nothing else, read these.

1. **Branch‑First** — even a single standalone shop is stored as a **Brand that owns exactly one Branch**. Nobody is ever "just a salon". This means growing from one shop to many is *adding a branch*, never a painful data migration.
2. **Barber is standalone** — a barber is an **independent entity**, not a child of a salon. A barber can be a freelancer (including **at‑home** service), and can be linked to one *or many* brands/branches through a flexible affiliation layer.
3. **Backend‑driven UI** — the visual shop floor (clickable chairs, green = free now) is **described by the backend** and simply *drawn* by the app. The look is good, but it is generated, not hand‑built per shop.
4. **Two universes** — the consumer experience is split into **Men's Grooming** and **Women's Beauty**, with **unisex** shops appearing in both where relevant.

---
