---
nodeid: backend.10-c4-containers
parentnode: backend.docs
childnodes:
  - backend.10-c4-containers.part-2
  - backend.10-c4-containers.part-3
codeanchors:
  - backend/modules/
---

# 10 — C4 Containers (Level 2)

> **Inside the one box.** The major moving parts (the "containers" in C4 terms) and how they talk. This records the **intended technical context** for shared understanding — but contains **no code, no schema, no configuration.** Versions/tools are the owner's choices and should be confirmed at build time.

---

## The container view

```mermaid
flowchart TB
    subgraph USERS[People]
        CL["Client"]
        BB["Barber"]
        OW["Owner / Manager"]
        AD["Platform Admin"]
    end

    subgraph Dorak[Dorak system]
        APP["Client Mobile App<br/>(Flutter) - draws the backend-described floor plan"]
        ADMIN["Admin / Owner Panel<br/>(Next.js dashboard)"]
        API["Application & API<br/>(Laravel) - business rules, floor-plan assembly, currency conversion, booking guarantee"]
        AUTH["Authentication<br/>(token-based, e.g. Sanctum)"]
        DB[("Primary Database<br/>(MySQL) - tenants, branches, chairs, barbers, bookings, ...")]
        NOTIF["Notification dispatch<br/>(minimal for MVP) [Later: SMS/WhatsApp]"]
    end

    subgraph EXTERNAL[External - minimal]
        MAP["Map / location provider"]
        FX["Exchange-rate source<br/>(admin-entered for MVP)"]
    end

    CL --> APP
    BB --> APP
    OW --> ADMIN
    AD --> ADMIN

    APP -->|"requests data & actions"| API
    ADMIN -->|"manages tenants & content"| API
    APP --> AUTH
    ADMIN --> AUTH
    API --> AUTH

    API -->|"reads / writes"| DB
    API -->|"triggers"| NOTIF
    API -->|"proximity / placement"| MAP
    API -->|"reads rates"| FX

    API -.->|"floor-plan description (layout payload)"| APP
```

---

## Continued in

- [Part 2: The containers (plain English)](10-c4-containers-part-2.md)
- [Part 3: The signature data flow — Backend‑Driven UI](10-c4-containers-part-3.md)
