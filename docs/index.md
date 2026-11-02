---
nodeid: docs.graph
parentnode: repo.root
childnodes:
  - docs.architecture
  - docs.decisions
  - docs.remediation
codeanchors:
  - docs/
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Documentation Graph

> Repository-wide documentation router. The graph root is the repository [`index.md`](../index.md).
> Follow the folder node for a subsystem, then choose a document leaf. All maintained Markdown documents in this repository are listed below.

## Graph roots

- [Repository rules](../index.md) — root-level orientation and subsystem entry points.
- [Backend](../backend/README.md) — Laravel service and product docs.
- [Dashboard](../frontend/dashboard/AGENTS.md) — Next.js application.
- [Mobile](../frontend/mobile/AGENTS.md) — Flutter workspace.

## Folder graph

```mermaid
graph TD
  root[index.md] --> graph[docs/index.md]
  graph --> repo[Repository-wide Markdown nodes]
  repo --> backend[backend/]
  repo --> dashboard[frontend/dashboard/]
  repo --> mobile[frontend/mobile/]
  repo --> project[docs/ and root guides]
```

## Document nodes

Entries are grouped by repository-relative folder. Every listed file is reachable from this index. Skill internals (`.claude/`), `references/` folders, and native platform asset READMEs are intentionally not listed.

### `./`

- [Agents](../AGENTS.md)
- [Claude](../CLAUDE.md)
- [Readme](../README.md)
- [Index](../index.md)

### `backend/`

- [Agents](../backend/AGENTS.md)
- [Claude](../backend/CLAUDE.md)
- [Readme](../backend/README.md)

### `backend/docs/`

- [01 Vision And Scope](../backend/docs/01-vision-and-scope.md)
- [02 Prd](../backend/docs/02-prd.md)
- [03 Persona Journeys](../backend/docs/03-persona-journeys.md)
- [04 House Rules](../backend/docs/04-house-rules.md)
- [05 Domain Glossary](../backend/docs/05-domain-glossary.md)
- [05 Recommendation Prd](../backend/docs/05-recommendation-prd.md)
- [06 Entity Model Abstract](../backend/docs/06-entity-model-abstract.md)
- [07 User Flows](../backend/docs/07-user-flows.md)
- [08 Edge Cases](../backend/docs/08-edge-cases.md)
- [09 C4 Context](../backend/docs/09-c4-context.md)
- [10 C4 Containers](../backend/docs/10-c4-containers.md)
- [11 Backend Architecture](../backend/docs/11-backend-architecture.md)
- [12 Implementation Prd](../backend/docs/12-implementation-prd.md)
- [13 Technical Concepts](../backend/docs/13-technical-concepts.md)
- [14 Execution Status](../backend/docs/14-execution-status.md)
- [16 Deployment Operations](../backend/docs/16-deployment-operations.md)
- [Readme](../backend/docs/README.md)
- [Feature Index](../backend/docs/feature-index.md)

### `backend/docs/features/`

- [Be 01 Core Infrastructure](../backend/docs/features/be-01-core-infrastructure.md)
- [Be 02 Client Auth](../backend/docs/features/be-02-client-auth.md)
- [Be 03 Explore Api](../backend/docs/features/be-03-explore-api.md)
- [Be 04 Floor Plan Booking](../backend/docs/features/be-04-floor-plan-booking.md)
- [Be 05 Review Api](../backend/docs/features/be-05-review-api.md)
- [Be 06 Brand Api](../backend/docs/features/be-06-brand-api.md)
- [Be 07 Barber Affiliation Api](../backend/docs/features/be-07-barber-affiliation-api.md)
- [Be 08 Job Posting Api](../backend/docs/features/be-08-job-posting-api.md)
- [Be 09 Admin Activation Api](../backend/docs/features/be-09-admin-activation-api.md)
- [Be 10 Chair Api](../backend/docs/features/be-10-chair-api.md)
- [Be 11 Service Catalog Module](../backend/docs/features/be-11-service-catalog-module.md)
- [Be 12 Client History Module](../backend/docs/features/be-12-client-history-module.md)
- [Be 13 Client Face Profile Module](../backend/docs/features/be-13-client-face-profile-module.md)
- [Be 14 Client Interaction Module](../backend/docs/features/be-14-client-interaction-module.md)
- [Be 15 Recommendation Module](../backend/docs/features/be-15-recommendation-module.md)
- [Be 16 Ai Sdk Postgresql Setup](../backend/docs/features/be-16-ai-sdk-postgresql-setup.md)
- [Be 17 Explore Enhancements](../backend/docs/features/be-17-explore-enhancements.md)
- [Be 18 Context Driven Namespacing](../backend/docs/features/be-18-context-driven-namespacing.md)
- [Be 19 Profile Expand](../backend/docs/features/be-19-profile-expand.md)
- [Be 20 Monetization](../backend/docs/features/be-20-monetization.md)

### `backend/docs/marketing/`

- [01 Brand Dna](../backend/docs/marketing/01-brand-dna.md)
- [02 Platform Setup](../backend/docs/marketing/02-platform-setup.md)
- [03 Content Strategy](../backend/docs/marketing/03-content-strategy.md)
- [04 Launch Campaign](../backend/docs/marketing/04-launch-campaign.md)
- [05 Metadata And Seo](../backend/docs/marketing/05-metadata-and-seo.md)
- [06 Teaser Content Plan](../backend/docs/marketing/06-teaser-content-plan.md)
- [07 Conversion Assets](../backend/docs/marketing/07-conversion-assets.md)
- [08 Visual Assets Inventory](../backend/docs/marketing/08-visual-assets-inventory.md)

### `backend/modules/Website/docs/`

- [01 Vision And Scope](../backend/modules/Website/docs/01-vision-and-scope.md)
- [02 Prd](../backend/modules/Website/docs/02-prd.md)
- [03 Persona Journeys](../backend/modules/Website/docs/03-persona-journeys.md)
- [04 House Rules](../backend/modules/Website/docs/04-house-rules.md)
- [05 Domain Glossary](../backend/modules/Website/docs/05-domain-glossary.md)
- [06 Content And Ui Model Abstract](../backend/modules/Website/docs/06-content-and-ui-model-abstract.md)
- [07 User Flows](../backend/modules/Website/docs/07-user-flows.md)
- [08 Edge Cases](../backend/modules/Website/docs/08-edge-cases.md)
- [09 C4 Context](../backend/modules/Website/docs/09-c4-context.md)
- [10 C4 Containers](../backend/modules/Website/docs/10-c4-containers.md)
- [11 Frontend Architecture](../backend/modules/Website/docs/11-frontend-architecture.md)
- [Readme](../backend/modules/Website/docs/README.md)

### `backend/process/`

- [Kanban](../backend/process/kanban.md)
- [Process](../backend/process/process.md)

### `docs/`

- [Architecture](architecture.md)
- [Decisions Required](decisions-required.md)
- [Deployment Guide](deployment-guide.md)
- [Frontend Architecture](frontend-architecture.md)
- [Index](index.md)
- [Remediation Plan](remediation-plan.md)

### `docs/adr/`

- [0001 Brand Owner As Client](adr/0001-brand-owner-as-client.md)

### `frontend/dashboard/`

- [Agents](../frontend/dashboard/AGENTS.md)
- [Claude](../frontend/dashboard/CLAUDE.md)

### `frontend/dashboard/docs/architecture/`

- [Backend Additions](../frontend/dashboard/docs/architecture/backend-additions.md)
- [Frontend Auth Contract](../frontend/dashboard/docs/architecture/frontend-auth-contract.md)

### `frontend/mobile/`

- [Agents](../frontend/mobile/AGENTS.md)
- [Claude](../frontend/mobile/CLAUDE.md)

### `frontend/mobile/apps/business_app/`

- [Agents](../frontend/mobile/apps/business_app/AGENTS.md)
- [Claude](../frontend/mobile/apps/business_app/CLAUDE.md)
- [Readme](../frontend/mobile/apps/business_app/README.md)

### `frontend/mobile/apps/business_app/docs/`

- [Feature Index](../frontend/mobile/apps/business_app/docs/feature-index.md)

### `frontend/mobile/apps/client_app/`

- [Agents](../frontend/mobile/apps/client_app/AGENTS.md)
- [Claude](../frontend/mobile/apps/client_app/CLAUDE.md)
- [Readme](../frontend/mobile/apps/client_app/README.md)

### `frontend/mobile/apps/client_app/docs/`

- [Feature Index](../frontend/mobile/apps/client_app/docs/feature-index.md)

### `frontend/mobile/apps/client_app/docs/runtime/`

- [App Lifecycle](../frontend/mobile/apps/client_app/docs/runtime/app-lifecycle.md)

### `frontend/mobile/apps/stylist_app/`

- [Agents](../frontend/mobile/apps/stylist_app/AGENTS.md)
- [Claude](../frontend/mobile/apps/stylist_app/CLAUDE.md)
- [Readme](../frontend/mobile/apps/stylist_app/README.md)

### `frontend/mobile/apps/stylist_app/docs/`

- [Feature Index](../frontend/mobile/apps/stylist_app/docs/feature-index.md)

### `frontend/mobile/docs/`

- [Architecture](../frontend/mobile/docs/architecture.md)
- [Feature Index](../frontend/mobile/docs/feature-index.md)
- [Index](../frontend/mobile/docs/index.md)

### `frontend/mobile/docs/architecture/`

- [Coding Conventions](../frontend/mobile/docs/architecture/coding-conventions.md)

### `frontend/mobile/docs/architecture/decisions/`

- [0001 Bloc In Core](../frontend/mobile/docs/architecture/decisions/0001-bloc-in-core.md)
- [0002 Design System Go Router](../frontend/mobile/docs/architecture/decisions/0002-design-system-go-router.md)

### `frontend/mobile/docs/authentication/`

- [Auth Flow](../frontend/mobile/docs/authentication/auth-flow.md)
- [Password Recovery](../frontend/mobile/docs/authentication/password-recovery.md)

### `frontend/mobile/docs/core/`

- [Background Tasks](../frontend/mobile/docs/core/background-tasks.md)
- [Exceptions](../frontend/mobile/docs/core/exceptions.md)
- [Interceptors](../frontend/mobile/docs/core/interceptors.md)
- [Networking](../frontend/mobile/docs/core/networking.md)
- [Result State](../frontend/mobile/docs/core/result-state.md)
- [Session](../frontend/mobile/docs/core/session.md)
- [Storage](../frontend/mobile/docs/core/storage.md)

### `frontend/mobile/docs/design-system/`

- [Index](../frontend/mobile/docs/design-system/index.md)

### `frontend/mobile/docs/design-system/components/loading/`

- [Button](../frontend/mobile/docs/design-system/components/loading/button.md)
- [Fullscreen](../frontend/mobile/docs/design-system/components/loading/fullscreen.md)
- [Inline](../frontend/mobile/docs/design-system/components/loading/inline.md)

### `frontend/mobile/docs/design-system/components/shimmer/`

- [Text](../frontend/mobile/docs/design-system/components/shimmer/text.md)

### `frontend/mobile/docs/design-system/states/`

- [Authentication Required](../frontend/mobile/docs/design-system/states/authentication-required.md)
- [Empty](../frontend/mobile/docs/design-system/states/empty.md)
- [Network Error](../frontend/mobile/docs/design-system/states/network-error.md)
- [Offline](../frontend/mobile/docs/design-system/states/offline.md)
- [Retry](../frontend/mobile/docs/design-system/states/retry.md)
- [Session Expired](../frontend/mobile/docs/design-system/states/session-expired.md)

### `frontend/mobile/docs/flows/`

- [App Launch](../frontend/mobile/docs/flows/app-launch.md)
- [Guest Access](../frontend/mobile/docs/flows/guest-access.md)
- [Onboarding](../frontend/mobile/docs/flows/onboarding.md)

### `frontend/mobile/docs/future-features/per-page/`

- [Per Page](../frontend/mobile/docs/future-features/per-page/per-page.md)

### `frontend/mobile/docs/navigation/`

- [Guards](../frontend/mobile/docs/navigation/guards.md)
- [Routes](../frontend/mobile/docs/navigation/routes.md)

### `frontend/mobile/docs/realtime/`

- [Reverb](../frontend/mobile/docs/realtime/reverb.md)

### `frontend/mobile/docs/runtime/`

- [App Lifecycle](../frontend/mobile/docs/runtime/app-lifecycle.md)

### `frontend/mobile/docs/screens/authentication/`

- [Create New Password](../frontend/mobile/docs/screens/authentication/create-new-password.md)
- [Forgot Password](../frontend/mobile/docs/screens/authentication/forgot-password.md)
- [Password Reset Success](../frontend/mobile/docs/screens/authentication/password-reset-success.md)
- [Recovery Otp](../frontend/mobile/docs/screens/authentication/recovery-otp.md)

### `frontend/mobile/docs/state-management/`

- [Async State](../frontend/mobile/docs/state-management/async-state.md)
- [Conventions](../frontend/mobile/docs/state-management/conventions.md)
- [Index](../frontend/mobile/docs/state-management/index.md)
- [Pagination](../frontend/mobile/docs/state-management/pagination.md)
- [Refresh](../frontend/mobile/docs/state-management/refresh.md)

### `frontend/mobile/packages/core/`

- [Agents](../frontend/mobile/packages/core/AGENTS.md)
- [Changelog](../frontend/mobile/packages/core/CHANGELOG.md)
- [Claude](../frontend/mobile/packages/core/CLAUDE.md)
- [Readme](../frontend/mobile/packages/core/README.md)

### `frontend/mobile/packages/design_system/`

- [Agents](../frontend/mobile/packages/design_system/AGENTS.md)
- [Changelog](../frontend/mobile/packages/design_system/CHANGELOG.md)
- [Claude](../frontend/mobile/packages/design_system/CLAUDE.md)
- [Readme](../frontend/mobile/packages/design_system/README.md)

### `frontend/mobile/packages/localization/`

- [Agents](../frontend/mobile/packages/localization/AGENTS.md)
- [Changelog](../frontend/mobile/packages/localization/CHANGELOG.md)
- [Claude](../frontend/mobile/packages/localization/CLAUDE.md)
- [Readme](../frontend/mobile/packages/localization/README.md)
