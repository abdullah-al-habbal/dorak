---
nodeid: backend.09-c4-context.part-2
parentnode: backend.09-c4-context
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [09 — C4 Context (Level 1)](09-c4-context.md) · [Previous](09-c4-context.md)

## Supporting external services (intentionally light for MVP)

- **Map / location provider** — to place shops and rank by **proximity**. Use the **simplest workable option** now; **localization (OSM/Mapbox choice) is 🔭 Later**.
- **Push / notification delivery** — for invites, applications, and booking updates. Keep **minimal** for MVP; **SMS/WhatsApp gateways are 🔭 Later**.
- **Currency exchange‑rate source** — feeds on‑the‑fly conversion. For MVP this can be **admin‑entered rates**; an automated feed is optional later.

> Everything the user explicitly deprioritized (offline mode, map localization, SMS/WhatsApp engineering) lives at this boundary as **Later**, so it doesn't leak into the MVP.

---

## What this level fixes

- Dorak is **one product** with **five kinds of users** and a **small** set of external dependencies.
- The **two‑universe** nature is a property of the system as a whole, not a separate system.
- External dependencies are **swappable and minimal**, protecting the MVP from heavy integration work.

Next: how the one box is built internally → `10-c4-containers.md`.
