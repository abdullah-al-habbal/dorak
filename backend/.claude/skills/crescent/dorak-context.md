---
nodeid: skills.backend.crescent.dorak-context
parentnode: skills.backend.crescent
childnodes: []
codeanchors:
  - backend/docs/
---

# Dorak Context for CRESCENT

## Repository Structure
- **Backend:** Laravel 13 modular monolith
- **Dashboard:** Next.js, `frontend/web/dashboard/`
- **Mobile:** Flutter workspace, `frontend/mobile/` (3 apps and shared packages)

## GitHub Integration
- **No Jira/GitLab.** We use GitHub Issues and PRs exclusively.
- **Repository:** one monorepo, `abdullah-al-habbal/dorak`
- **Tracking:** open work is in `docs/backlog/index.md`
- **Delivery:** push only as the root `AGENTS.md` allows
- **Branch naming:** feature/<slug>, bugfix/<slug>

## Documentation Structure
All features live in docs/features/<feature-slug>/:
- IDEA.md (Phase 1)
- research.md (Phase 2)
- prototype/ (Phase 3)
- PRD.md (Phase 4 - uses Dorak 11-file Harness format)
- kanban.md (Phase 5 - GitHub issue index)
- qa-plan.md (Phase 7)

## Dorak-Specific Rules
1. PRD Format: Use the 11-file Harness structure.
2. Feature Index: Append to docs/feature-index.md after completion.
3. Code standards: each subsystem's `AGENTS.md`; backend also `10StrictBackendArchitecture`.
