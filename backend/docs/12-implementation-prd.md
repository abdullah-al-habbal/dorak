---
nodeid: backend.12-implementation-prd
parentnode: backend.docs
childnodes:
  - backend.12-implementation-prd.part-2
  - backend.12-implementation-prd.part-3
  - backend.12-implementation-prd.part-4
codeanchors:
  - backend/modules/
---

# 12 — Implementation PRD: From Current State to MVP

> ⚠️ **HISTORICAL (updated 2026-08-09):** All Track A + Track B gaps resolved. The Flutter frontend was removed on 2026-08-09 and is being rebuilt from scratch (new UI/UX). Sections referencing `dorak_client_app` screens (§1 Track B consumer, §4) are superseded — treat API endpoints as the stable contract.

> **Preface:** All 20 backend modules have database schema + Filament admin panels. "CRUD" in Dorak means **Filament management UI**, not REST API. This document clarifies what exists, what's missing, and what to build in what order — across **two tracks**: Admin Panel (Filament) and Client API (REST).
> Consumes the current-state snapshot from `dorak/report.md`.

---

## 1. The Two Tracks

| Track | What it builds | Consumer | Priority now |
|-------|---------------|----------|-------------|
| **A — Admin Panel** | Filament resources, pages, actions, widgets | Brand owners, branch managers, platform admins | **Finish gaps first** (blocker for Track B) |
| **B — Client API** | REST endpoints consumed by mobile apps | `dorak_client_app` (Flutter), future barber/business apps | **After Track A** for each module |

Each module may need Track A, Track B, or both:

| Module | A: Filament | B: API | Status |
|--------|-------------|--------|--------|
| Core | Foundation config | Health check | ✅ Both |
| Client | Admin CRUD | Auth + Profile | ✅ Both |
| Explore | — | Branches, Barbers, details | B ✅ only |
| Booking | Admin CRUD | Create, Cancel, Show, List | A ✅; B ✅ |
| Review | Admin CRUD | Submit, List by branch | A ✅; B ✅ |
| Floor Plan | — | Get floor plan | B ✅ only |
| Marketing | — | CMS pages | B ✅ only |
| Website | — | Web pages | B ✅ only |
| Branch | Admin + Branch panels | (Explore covers read) | A ✅; B partial |
| Barber | Admin + Barber panels | (Explore covers read) | A ✅; B partial |
| Brand | Standard CRUD | **Needed** | A ✅; B ✅ (list, show) |
| Chair | Standard CRUD | list, show, update | A ✅; B ✅ |
| OfferedService | Standard CRUD | barber services CRUD, public list | A ✅; B ✅ |
| Currency + ExchangeRate | Standard CRUD (2 resources) | list, exchange rates, convert | A ✅; B ✅ |
| JobPosting + Application | Standard CRUD | **Needed** | A ✅; B ✅ (list, show, apply) |
| BarberAffiliation | Standard CRUD | **Needed** | A ✅; B ✅ (create, accept, reject, list) |
| Activation | Read-only + ToggleAction | barber/branch activate and deactivate | A ✅; B ✅ |
| Ban | Standard CRUD | client ban check | A ✅; B ✅ |
| Admin | Standard CRUD | — | A ✅ only |
| Language | Standard CRUD | — | A ✅ only |
| Preference | Standard CRUD | — | A ✅ only |

---

## Continued in

- [Part 2: 2. Track A: Admin Panel Gaps](12-implementation-prd-part-2.md)
- [Part 3: API Pattern (per existing convention)](12-implementation-prd-part-3.md)
- [Part 4: 5. Backfill: Test Coverage](12-implementation-prd-part-4.md)
