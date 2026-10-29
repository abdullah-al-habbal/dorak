---
nodeid: docs.graph
parentnode: repo.root
childnodes:
  - backend.guide
  - dashboard.guide
  - mobile.guide
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
  root[index.md] --> graph[docs/INDEX.md]
  graph --> repo[Repository-wide Markdown nodes]
  repo --> backend[backend/]
  repo --> dashboard[frontend/dashboard/]
  repo --> mobile[frontend/mobile/]
  repo --> project[docs/ and root guides]
```

## Document nodes

Entries are grouped by their repository-relative folder. Each linked file is a leaf reachable from this graph; task specs also route through the canonical task list.

### `./`

- [Artifact](../artifact.md)

### `backend/`

- [Agents](../backend/AGENTS.md)

- [Claude](../backend/CLAUDE.md)

### `backend/docs/`

- [01 Vision And Scope](../backend/docs/01_vision-and-scope.md)

- [02 Prd](../backend/docs/02_prd.md)

- [03 Persona Journeys](../backend/docs/03_persona-journeys.md)

- [04 House Rules](../backend/docs/04_house-rules.md)

- [05 Domain Glossary](../backend/docs/05_domain-glossary.md)

- [05 Recommendation Prd](../backend/docs/05_recommendation-prd.md)

- [06 Entity Model Abstract](../backend/docs/06_entity-model-abstract.md)

- [07 User Flows](../backend/docs/07_user-flows.md)

- [08 Edge Cases](../backend/docs/08_edge-cases.md)

- [09 C4 Context](../backend/docs/09_c4-context.md)

- [10 C4 Containers](../backend/docs/10_c4-containers.md)

- [11 Backend Architecture](../backend/docs/11_backend-architecture.md)

- [12 Implementation Prd](../backend/docs/12_implementation-prd.md)

- [13 Technical Concepts](../backend/docs/13_technical-concepts.md)

- [14 Execution Status](../backend/docs/14_execution-status.md)

- [15 Post Launch Improvements](../backend/docs/15_post_launch_improvements.md)

- [16 Deployment Operations](../backend/docs/16_deployment-operations.md)

- [Actionable Plan](../backend/docs/actionable-plan.md)

- [Feature Index](../backend/docs/feature-index.md)

### `backend/docs/features/`

- [Be 01 Core Infrastructure](../backend/docs/features/BE-01-core-infrastructure.md)

- [Be 02 Client Auth](../backend/docs/features/BE-02-client-auth.md)

- [Be 03 Explore Api](../backend/docs/features/BE-03-explore-api.md)

- [Be 04 Floor Plan Booking](../backend/docs/features/BE-04-floor-plan-booking.md)

- [Be 05 Review Api](../backend/docs/features/BE-05-review-api.md)

- [Be 06 Brand Api](../backend/docs/features/BE-06-brand-api.md)

- [Be 07 Barber Affiliation Api](../backend/docs/features/BE-07-barber-affiliation-api.md)

- [Be 08 Job Posting Api](../backend/docs/features/BE-08-job-posting-api.md)

- [Be 09 Admin Activation Api](../backend/docs/features/BE-09-admin-activation-api.md)

- [Be 10 Chair Api](../backend/docs/features/BE-10-chair-api.md)

- [Be 11 Service Catalog Module](../backend/docs/features/BE-11-service-catalog-module.md)

- [Be 12 Client History Module](../backend/docs/features/BE-12-client-history-module.md)

- [Be 13 Client Face Profile Module](../backend/docs/features/BE-13-client-face-profile-module.md)

- [Be 14 Client Interaction Module](../backend/docs/features/BE-14-client-interaction-module.md)

- [Be 15 Recommendation Module](../backend/docs/features/BE-15-recommendation-module.md)

- [Be 16 Ai Sdk Postgresql Setup](../backend/docs/features/BE-16-ai-sdk-postgresql-setup.md)

- [Be 17 Explore Enhancements](../backend/docs/features/BE-17-explore-enhancements.md)

- [Be 18 Context Driven Namespacing](../backend/docs/features/BE-18-context-driven-namespacing.md)

- [Be 19 Profile Expand](../backend/docs/features/BE-19-profile-expand.md)

### `backend/docs/features/recommendation-module/`

- [Idea](../backend/docs/features/recommendation-module/IDEA.md)

- [Kanban](../backend/docs/features/recommendation-module/kanban.md)

- [Prd](../backend/docs/features/recommendation-module/PRD.md)

### `backend/docs/features/recommendation-module/prototype/`

- [Notes](../backend/docs/features/recommendation-module/prototype/NOTES.md)

### `backend/docs/marketing/`

- [01 Brand Dna](../backend/docs/marketing/01_brand-dna.md)

- [02 Platform Setup](../backend/docs/marketing/02_platform-setup.md)

- [03 Content Strategy](../backend/docs/marketing/03_content-strategy.md)

- [04 Launch Campaign](../backend/docs/marketing/04_launch-campaign.md)

- [05 Metadata And Seo](../backend/docs/marketing/05_metadata-and-seo.md)

- [06 Teaser Content Plan](../backend/docs/marketing/06_teaser-content-plan.md)

- [07 Conversion Assets](../backend/docs/marketing/07_conversion-assets.md)

- [08 Visual Assets Inventory](../backend/docs/marketing/08_visual-assets-inventory.md)

### `backend/docs/`

- [Readme](../backend/docs/README.md)

### `backend/docs/refactor/context-namespacing/`

- [Result](../backend/docs/refactor/context-namespacing/RESULT.md)

- [Tracker](../backend/docs/refactor/context-namespacing/TRACKER.md)

### `backend/modules/Website/docs/`

- [01Visionandscope](../backend/modules/Website/docs/01VisionAndScope.md)

- [02Prd](../backend/modules/Website/docs/02Prd.md)

- [03Personajourneys](../backend/modules/Website/docs/03PersonaJourneys.md)

- [04Houserules](../backend/modules/Website/docs/04HouseRules.md)

- [05Domainglossary](../backend/modules/Website/docs/05DomainGlossary.md)

- [06Contentanduimodelabstract](../backend/modules/Website/docs/06ContentAndUiModelAbstract.md)

- [07Userflows](../backend/modules/Website/docs/07UserFlows.md)

- [08Edgecases](../backend/modules/Website/docs/08EdgeCases.md)

- [09C4Context](../backend/modules/Website/docs/09C4Context.md)

- [10C4Containers](../backend/modules/Website/docs/10C4Containers.md)

- [11Frontendarchitecture](../backend/modules/Website/docs/11FrontendArchitecture.md)

### `backend/modules/Website/docs/planning/`

- [01 Implementation Prd](../backend/modules/Website/docs/planning/01_implementation_prd.md)

- [02 File Manifest](../backend/modules/Website/docs/planning/02_file_manifest.md)

### `backend/modules/Website/docs/`

- [Readme](../backend/modules/Website/docs/README.md)

### `backend/process/`

- [Kanban](../backend/process/KANBAN.md)

- [Process](../backend/process/PROCESS.md)

### `backend/`

- [Readme](../backend/README.md)

### `docs/`

- [Actionable Plan](actionable-plan.md)

- [Architecture](ARCHITECTURE.md)

- [Dashboard Implementation Plan](DASHBOARD_IMPLEMENTATION_PLAN.md)

- [Decisions Required](decisions-required.md)
- [ADR 0001 Brand Owner As Client](adr/0001-brand-owner-as-client.md)

- [Deployment Guide](DEPLOYMENT_GUIDE.md)

- [Frontend Architecture](FRONTEND_ARCHITECTURE.md)

- [Mvp Gap Analysis And Monorepo Roadmap](mvp-gap-analysis-and-monorepo-roadmap.md)

- [Remediation Plan](REMEDIATION_PLAN.md)

### `frontend/dashboard/`

- [Agents](../frontend/dashboard/AGENTS.md)

- [Claude](../frontend/dashboard/CLAUDE.md)

### `frontend/dashboard/docs/architecture/`

- [Backend Additions](../frontend/dashboard/docs/architecture/backend-additions.md)

- [Frontend Auth Contract](../frontend/dashboard/docs/architecture/frontend-auth-contract.md)

### `frontend/dashboard/`

- [Execution Plan](../frontend/dashboard/EXECUTION_PLAN.md)

### `frontend/mobile/`

- [Agents](../frontend/mobile/AGENTS.md)

### `frontend/mobile/apps/business_app/`

- [Agents](../frontend/mobile/apps/business_app/AGENTS.md)

- [Claude](../frontend/mobile/apps/business_app/CLAUDE.md)

### `frontend/mobile/apps/business_app/docs/`

- [Feature Index](../frontend/mobile/apps/business_app/docs/feature-index.md)

### `frontend/mobile/apps/business_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/`

- [Readme](../frontend/mobile/apps/business_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md)

### `frontend/mobile/apps/business_app/`

- [Readme](../frontend/mobile/apps/business_app/README.md)

### `frontend/mobile/apps/client_app/`

- [Agents](../frontend/mobile/apps/client_app/AGENTS.md)

- [Claude](../frontend/mobile/apps/client_app/CLAUDE.md)

### `frontend/mobile/apps/client_app/docs/`

- [Feature Index](../frontend/mobile/apps/client_app/docs/feature-index.md)

### `frontend/mobile/apps/client_app/docs/runtime/`

- [App Lifecycle](../frontend/mobile/apps/client_app/docs/runtime/app_lifecycle.md)

### `frontend/mobile/apps/client_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/`

- [Readme](../frontend/mobile/apps/client_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md)

### `frontend/mobile/apps/client_app/`

- [Readme](../frontend/mobile/apps/client_app/README.md)

### `frontend/mobile/apps/stylist_app/`

- [Agents](../frontend/mobile/apps/stylist_app/AGENTS.md)

- [Claude](../frontend/mobile/apps/stylist_app/CLAUDE.md)

### `frontend/mobile/apps/stylist_app/docs/`

- [Feature Index](../frontend/mobile/apps/stylist_app/docs/feature-index.md)

### `frontend/mobile/apps/stylist_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/`

- [Readme](../frontend/mobile/apps/stylist_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md)

### `frontend/mobile/apps/stylist_app/`

- [Readme](../frontend/mobile/apps/stylist_app/README.md)

### `frontend/mobile/`

- [Claude](../frontend/mobile/CLAUDE.md)

### `frontend/mobile/docs/`

- [Actionable Plan](../frontend/mobile/docs/actionable-plan.md)

- [Architecture](../frontend/mobile/docs/ARCHITECTURE.md)

### `frontend/mobile/docs/architecture/`

- [Coding Conventions](../frontend/mobile/docs/architecture/coding_conventions.md)

### `frontend/mobile/docs/architecture/decisions/`

- [0001 Bloc In Core](../frontend/mobile/docs/architecture/decisions/0001-bloc-in-core.md)

- [0002 Design System Go Router](../frontend/mobile/docs/architecture/decisions/0002-design-system-go-router.md)

- [0003 Track 12 Before 05 And 10](../frontend/mobile/docs/architecture/decisions/0003-track-12-before-05-and-10.md)

### `frontend/mobile/docs/authentication/`

- [Auth Flow](../frontend/mobile/docs/authentication/auth_flow.md)

- [Password Recovery](../frontend/mobile/docs/authentication/password_recovery.md)

### `frontend/mobile/docs/core/`

- [Background Tasks](../frontend/mobile/docs/core/background_tasks.md)

- [Exceptions](../frontend/mobile/docs/core/exceptions.md)

- [Interceptors](../frontend/mobile/docs/core/interceptors.md)

- [Networking](../frontend/mobile/docs/core/networking.md)

- [Result State](../frontend/mobile/docs/core/result_state.md)

- [Session](../frontend/mobile/docs/core/session.md)

- [Storage](../frontend/mobile/docs/core/storage.md)

### `frontend/mobile/docs/design_system/components/loading/`

- [Button](../frontend/mobile/docs/design_system/components/loading/button.md)

- [Fullscreen](../frontend/mobile/docs/design_system/components/loading/fullscreen.md)

- [Inline](../frontend/mobile/docs/design_system/components/loading/inline.md)

### `frontend/mobile/docs/design_system/components/shimmer/`

- [Text](../frontend/mobile/docs/design_system/components/shimmer/text.md)

### `frontend/mobile/docs/design_system/`

- [Index](../frontend/mobile/docs/design_system/index.md)

### `frontend/mobile/docs/design_system/states/`

- [Authentication Required](../frontend/mobile/docs/design_system/states/authentication_required.md)

- [Empty](../frontend/mobile/docs/design_system/states/empty.md)

- [Network Error](../frontend/mobile/docs/design_system/states/network_error.md)

- [Offline](../frontend/mobile/docs/design_system/states/offline.md)

- [Retry](../frontend/mobile/docs/design_system/states/retry.md)

- [Session Expired](../frontend/mobile/docs/design_system/states/session_expired.md)

### `frontend/mobile/docs/`

- [Feature Index](../frontend/mobile/docs/feature-index.md)

### `frontend/mobile/docs/flows/`

- [App Launch](../frontend/mobile/docs/flows/app_launch.md)

- [Guest Access](../frontend/mobile/docs/flows/guest_access.md)

- [Onboarding](../frontend/mobile/docs/flows/onboarding.md)

### `frontend/mobile/docs/future-features/`

- [Discovery 016](../frontend/mobile/docs/future-features/discovery-016.md)

### `frontend/mobile/docs/future-features/perPage/`

- [Perpage](../frontend/mobile/docs/future-features/perPage/perPage.md)

### `frontend/mobile/docs/`

- [Handover](../frontend/mobile/docs/handover.md)

- [Index](../frontend/mobile/docs/index.md)

### `frontend/mobile/docs/navigation/`

- [Guards](../frontend/mobile/docs/navigation/guards.md)

- [Routes](../frontend/mobile/docs/navigation/routes.md)

### `frontend/mobile/docs/realtime/`

- [Reverb](../frontend/mobile/docs/realtime/reverb.md)

### `frontend/mobile/docs/`

- [Remediation Plan](../frontend/mobile/docs/REMEDIATION_PLAN.md)

### `frontend/mobile/docs/runtime/`

- [App Lifecycle](../frontend/mobile/docs/runtime/app_lifecycle.md)

### `frontend/mobile/docs/screens/authentication/`

- [Create New Password](../frontend/mobile/docs/screens/authentication/create_new_password.md)

- [Forgot Password](../frontend/mobile/docs/screens/authentication/forgot_password.md)

- [Password Reset Success](../frontend/mobile/docs/screens/authentication/password_reset_success.md)

- [Recovery Otp](../frontend/mobile/docs/screens/authentication/recovery_otp.md)

### `frontend/mobile/docs/state_management/`

- [Async State](../frontend/mobile/docs/state_management/async_state.md)

- [Conventions](../frontend/mobile/docs/state_management/conventions.md)

- [Index](../frontend/mobile/docs/state_management/index.md)

- [Pagination](../frontend/mobile/docs/state_management/pagination.md)

- [Refresh](../frontend/mobile/docs/state_management/refresh.md)

### `frontend/mobile/docs/stitch/exports/015_design/`

- [Design](../frontend/mobile/docs/stitch/exports/015_design/DESIGN.md)

- [Plan](../frontend/mobile/docs/stitch/exports/015_design/plan.md)

### `frontend/mobile/docs/stitch/exports/016_discovery_feed/`

- [Design](../frontend/mobile/docs/stitch/exports/016_discovery_feed/DESIGN.md)

- [Plan](../frontend/mobile/docs/stitch/exports/016_discovery_feed/plan.md)

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

### `./`

- [Index](../index.md)
