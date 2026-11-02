---
nodeid: backend.docs
parentnode: backend.guide
childnodes:
  - backend.01-vision-and-scope
  - backend.02-prd
  - backend.03-persona-journeys
  - backend.04-house-rules
  - backend.05-domain-glossary
  - backend.05-recommendation-prd
  - backend.06-entity-model-abstract
  - backend.07-user-flows
  - backend.08-edge-cases
  - backend.09-c4-context
  - backend.10-c4-containers
  - backend.11-backend-architecture
  - backend.12-implementation-prd
  - backend.13-technical-concepts
  - backend.14-execution-status
  - backend.16-deployment-operations
  - backend.feature-index
  - backend.marketing.01-brand-dna
  - backend.marketing.02-platform-setup
  - backend.marketing.03-content-strategy
  - backend.marketing.04-launch-campaign
  - backend.marketing.05-metadata-and-seo
  - backend.marketing.06-teaser-content-plan
  - backend.marketing.07-conversion-assets
  - backend.marketing.08-visual-assets-inventory
  - backend.docs.part-2
  - backend.docs.part-3
codeanchors:
  - backend/modules/
---

# Dorak Backend — Product Documentation

Repository routes: [backend guide](../AGENTS.md) · [documentation graph](../../docs/index.md).

This folder is the **single source of truth** for the product *before any backend or database design begins*. It contains **no code, no SQL, and no real database ERD** — entities are described in **plain English as objects with attributes**, and an **abstract** relationship view is provided where diagrams help understanding.

---

## What this documentation is (and is not)

| It **is** | It is **not** |
|---|---|
| Product truth (the "what" and "why") | Implementation (the "how in code") |
| Plain‑English entities + abstract relationships | A real database schema or migrations |
| Business laws frozen as simple rules | A spec that locks the team into one tech choice |
| A living, maintainable reference | A one‑time document that goes stale |

---

## Continued in

- [Part 2: Reading order](readme-part-2.md)
- [Part 3: Marketing documentation](readme-part-3.md)
