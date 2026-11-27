---
nodeid: backend.10-c4-containers.part-2
parentnode: backend.10-c4-containers
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [10 — C4 Containers (Level 2)](10-c4-containers.md) · [Previous](10-c4-containers.md) · [Next](10-c4-containers-part-3.md)

## The containers (plain English)

### Mobile apps — *Flutter*
Three apps: `client_app` for clients, `stylist_app` for barbers, and `business_app` for branches and brand owners. The client app's standout job is to **draw the backend‑described floor plan**: it receives a layout description (canvas + components: chairs colored by status, decorations) and renders it as tappable shapes. Tapping a free chair opens booking. It also handles discovery, profiles, at‑home booking (sharing location), reviews, invites, and job applications. It **does not** contain business rules — it asks the API.

### Admin / Owner Panel — *Next.js dashboard*
The management surface for **Owners, Managers, and Platform Admins**. Owners have full business settings, analytics, financial reports, all-branch, and manager-account access; managers are limited to daily operations, staff schedules, and bookings for one branch. MVP floor plans use standard form inputs/presets; drag-and-drop is Phase 3. In practice this is delivered by the Next.js dashboard, which calls the `/api/v1/dashboard/*` routes (see `11-backend-architecture.md`).

### Application & API — *Laravel*
The **brain**. It owns and enforces every business rule from `04-house-rules.md`, including:
- **Branch‑First** creation (a Brand always gets its first Branch),
- **assembling the floor‑plan description** the app draws (Backend‑Driven UI),
- **on‑the‑fly currency conversion** using the rate layer,
- the **no‑double‑booking guarantee** (the single most important behavior),
- **feature‑flag gating** read at the moment of action,
- **multi‑tenant isolation** so brands never see each other's data.

> **Internal structure (C4 Level 3):** the API is organized **modular‑by‑domain** — one module per aggregate — and every unit of work flows **Action → Handler → EloquentResolver** (no controllers, services, or repositories). Full detail in `11-backend-architecture.md`.

### Authentication — *token‑based (e.g., Sanctum)*
Identifies users and issues tokens. Encodes the locked role/permission differences: Owner business-wide access, Manager branch-local daily operations, staff schedules, and bookings, plus Barber, Client, and Admin policies.

### Primary Database — *MySQL*
Stores everything described in `06-entity-model-abstract.md`: tenants (brands), branches, chairs, barbers, affiliations, services, bookings, reviews, jobs, currencies, rates, settings. Entities use **stable, non‑guessable identifiers**. *(This doc names the database technology only — it defines **no schema**.)*

### Notification dispatch — *minimal for MVP*
Sends invites, application alerts, and booking updates. Kept deliberately light now; **SMS/WhatsApp gateway work is 🔭 Later**.

---
