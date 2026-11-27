---
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [10 — C4 Containers (Level 2)](10-c4-containers.md) · [Previous](10-c4-containers-part-2.md)

## The signature data flow — Backend‑Driven UI

This is the one flow worth understanding at the container level (described, not coded):

1. The **app** asks the **API** for a branch's floor plan.
2. The **API** assembles a **layout description** from that branch's chairs + their UI metadata: a canvas size and a list of components (each chair with shape, position, **live status color**, and any **linked barber**; plus static decorations).
3. The **app** receives this description and **draws** it as tappable shapes — **green = free now**.
4. Tapping a free chair shows the **linked barber + services** and opens **booking**, which the **API** confirms under the **no‑double‑booking** guarantee.

The look is good, but it is **generated centrally** — no per‑shop front‑end work.

---

## Intended technical context (for shared understanding only)

> The owner's stated stack. Recorded so everyone shares a mental model; **none of it is prescribed by these product docs**, and exact versions should be confirmed when building.

| Concern | Intended choice |
|---|---|
| Backend / API | Laravel (owner noted Laravel 13, PHP 8.5 — confirm at build time) |
| Database | MySQL |
| Auth | Token‑based (Sanctum) |
| Identifiers | UUID‑style, non‑guessable |
| Client app | Flutter |
| Admin panel | Next.js dashboard (`frontend/web/dashboard`) |
| Multi‑tenancy | SaaS, per‑brand isolation |
| Hosting | Hostinger (owner's intent) |

---

## What this level deliberately leaves open

- **Stored vs. computed floor plans** — implementation choice.
- **Notification channels** beyond a minimal default — 🔭 Later.
- **Stored vs. computed zone layout** — implementation choice within the locked unified-floor-plan rule.

> Levels 1–2 (Context, Containers) align the team on the system's shape. **Level 3 (components)** — the module layout and the Action → Handler → EloquentResolver structure — is now documented in `11-backend-architecture.md`. Code patterns are in the [backend guide](../AGENTS.md) and its skills.
