---
nodeid: repo.readme
parentnode: repo.root
childnodes:
  - repo.readme.part-2
  - repo.readme.part-3
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Dorak Operations Monorepo

Dorak Operations is a salon and barber operations platform. This repository
contains the Laravel API, the multi-actor web dashboard, and the Flutter mobile
workspace used by clients, branch teams, and stylists.

## Repository map

| Path | Project | Main technologies |
| --- | --- | --- |
| `backend/` | API, booking lifecycle, authorization, history, recommendations, and operations services | PHP 8.3+, Laravel 13, MySQL 8, Pest |
| `frontend/dashboard/` | Admin, branch manager, and barber web portals; server-side API bridge | Next.js 16, React, TypeScript |
| `frontend/mobile/` | Client, business, and stylist apps plus shared packages | Flutter, Dart, Melos |
| `docs/` | Cross-project architecture and decision records | Markdown |

Start with [the documentation index](docs/index.md),
and the subsystem guides in each project directory.

## Architecture at a glance

- The backend is a modular Laravel monolith. Domain code lives under
  `backend/modules/`; `Modules\Core` supplies shared infrastructure. The
  backend is the authority for authentication, branch scope, booking state,
  and API contracts.
- The Next.js dashboard provides separate `/admin`, `/manager`, and `/barber`
  portals. Its server-side API bridge handles backend communication and
  dashboard sessions.
- The mobile workspace contains `client_app`, `business_app`, and
  `stylist_app`, with shared `core`, `design_system`, and `localization`
  packages. Package boundaries and the Dart file taxonomy
  are described in `frontend/mobile/AGENTS.md`.

## Prerequisites

- PHP 8.3 or newer and Composer.
- MySQL 8 for local backend development and tests.
- Node.js and npm compatible with the dashboard's Next.js 16 dependencies.
- Flutter and Dart compatible with the SDK constraints in
  `frontend/mobile/pubspec.yaml`.

## Continued in

- [Part 2: Local setup](docs/repo-guides/readme-part-2.md)
- [Part 3: Mobile workspace](docs/repo-guides/readme-part-3.md)
