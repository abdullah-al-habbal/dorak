---
nodeid: docs.graph
parentnode: docs.todowork
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

> Repository-wide documentation router. The canonical work queue and graph root is [`docs/todowork.md`](todowork.md).
> Follow the folder node for a subsystem, then choose a document leaf. All maintained Markdown documents in this repository are listed below.

## Graph roots

- [Work and task specifications](todowork.md) — root node, project status, and task routes.
- [Repository rules](../index.md) — root-level orientation and subsystem entry points.
- [Backend](../backend/README.md) — Laravel service and product docs.
- [Dashboard](../frontend/dashboard/AGENTS.md) — Next.js application.
- [Mobile](../frontend/mobile/AGENTS.md) — Flutter workspace.

## Folder graph

```mermaid
graph TD
  root[docs/todowork.md] --> graph[docs/INDEX.md]
  root --> tasks[docs/tasks/]
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

### `docs/tasks/`

- [Task 01 Affiliation Ownership](tasks/task-01-affiliation-ownership.md) · routed from [todowork](todowork.md)

- [Task 02 Client History Ownership](tasks/task-02-client-history-ownership.md) · routed from [todowork](todowork.md)

- [Task 03 Admin Api Guards](tasks/task-03-admin-api-guards.md) · routed from [todowork](todowork.md)

- [Task 04 Service Catalog Authorization](tasks/task-04-service-catalog-authorization.md) · routed from [todowork](todowork.md)

- [Task 05 Chair Barber Assignment Scope](tasks/task-05-chair-barber-assignment-scope.md) · routed from [todowork](todowork.md)

- [Task 06 Job Application Status Authz](tasks/task-06-job-application-status-authz.md) · routed from [todowork](todowork.md)

- [Task 07 Face Photo Privacy](tasks/task-07-face-photo-privacy.md) · routed from [todowork](todowork.md)

- [Task 08 Ban Enforcement](tasks/task-08-ban-enforcement.md) · routed from [todowork](todowork.md)

- [Task 09 Activation Status Visibility](tasks/task-09-activation-status-visibility.md) · routed from [todowork](todowork.md)

- [Task 10 Dashboard Session Hardening](tasks/task-10-dashboard-session-hardening.md) · routed from [todowork](todowork.md)

- [Task 11 Bff Proxy Method Allowlist](tasks/task-11-bff-proxy-method-allowlist.md) · routed from [todowork](todowork.md)

- [Task 12 Branch Manager Scope](tasks/task-12-branch-manager-scope.md) · routed from [todowork](todowork.md)

- [Task 13 Booking Completion Null Barber](tasks/task-13-booking-completion-null-barber.md) · routed from [todowork](todowork.md)

- [Task 14 Catalog Id Contract](tasks/task-14-catalog-id-contract.md) · routed from [todowork](todowork.md)

- [Task 15 Face Analysis Dispatch](tasks/task-15-face-analysis-dispatch.md) · routed from [todowork](todowork.md)

- [Task 16 Fcm Http V1](tasks/task-16-fcm-http-v1.md) · routed from [todowork](todowork.md)

- [Task 17 Backfill Feature Tests](tasks/task-17-backfill-feature-tests.md) · routed from [todowork](todowork.md)

- [Task 18 Booking Lifecycle Service](tasks/task-18-booking-lifecycle-service.md) · routed from [todowork](todowork.md)

- [Task 19 Rebook Via Booking Engine](tasks/task-19-rebook-via-booking-engine.md) · routed from [todowork](todowork.md)

- [Task 20 Availability Semantics](tasks/task-20-availability-semantics.md) · routed from [todowork](todowork.md)

- [Task 21 Slot Availability Endpoint](tasks/task-21-slot-availability-endpoint.md) · routed from [todowork](todowork.md)

- [Task 22 Booking Hours Schedule Validation](tasks/task-22-booking-hours-schedule-validation.md) · routed from [todowork](todowork.md)

- [Task 23 Booking Service Ownership](tasks/task-23-booking-service-ownership.md) · routed from [todowork](todowork.md)

- [Task 24 Barber Booking Without Chair](tasks/task-24-barber-booking-without-chair.md) · routed from [todowork](todowork.md)

- [Task 25 At Home Booking Rules](tasks/task-25-at-home-booking-rules.md) · routed from [todowork](todowork.md)

- [Task 26 Client Booking List Statuses](tasks/task-26-client-booking-list-statuses.md) · routed from [todowork](todowork.md)

- [Task 27 Chair Maintenance Conflicts](tasks/task-27-chair-maintenance-conflicts.md) · routed from [todowork](todowork.md)

- [Task 28 Booking Notification Coverage](tasks/task-28-booking-notification-coverage.md) · routed from [todowork](todowork.md)

- [Task 29 Client Realtime Channel](tasks/task-29-client-realtime-channel.md) · routed from [todowork](todowork.md)

- [Task 30 Notification Delivery Records](tasks/task-30-notification-delivery-records.md) · routed from [todowork](todowork.md)

- [Task 31 Domain Event Notifications](tasks/task-31-domain-event-notifications.md) · routed from [todowork](todowork.md)

- [Task 32 Client Profile Endpoint](tasks/task-32-client-profile-endpoint.md) · routed from [todowork](todowork.md)

- [Task 33 Auth Payload Email Reverification](tasks/task-33-auth-payload-email-reverification.md) · routed from [todowork](todowork.md)

- [Task 34 Phone Otp Verification](tasks/task-34-phone-otp-verification.md) · routed from [todowork](todowork.md)

- [Task 35 Password Recovery Code Verification](tasks/task-35-password-recovery-code-verification.md) · routed from [todowork](todowork.md)

- [Task 36 Account Deletion Rules](tasks/task-36-account-deletion-rules.md) · routed from [todowork](todowork.md)

- [Task 37 Barber Self Signup](tasks/task-37-barber-self-signup.md) · routed from [todowork](todowork.md)

- [Task 38 Brand Owner Role](tasks/task-38-brand-owner-role.md) · routed from [todowork](todowork.md)

- [Task 39 Review Subject Resolution](tasks/task-39-review-subject-resolution.md) · routed from [todowork](todowork.md)

- [Task 40 Two Way Reviews Reputation](tasks/task-40-two-way-reviews-reputation.md) · routed from [todowork](todowork.md)

- [Task 41 Review Dispute Workflow](tasks/task-41-review-dispute-workflow.md) · routed from [todowork](todowork.md)

- [Task 42 Entity Rating Aggregates](tasks/task-42-entity-rating-aggregates.md) · routed from [todowork](todowork.md)

- [Task 43 Explore Text Search](tasks/task-43-explore-text-search.md) · routed from [todowork](todowork.md)

- [Task 44 Universe Unisex And Barber Filter](tasks/task-44-universe-unisex-and-barber-filter.md) · routed from [todowork](todowork.md)

- [Task 45 Freelancers In Search](tasks/task-45-freelancers-in-search.md) · routed from [todowork](todowork.md)

- [Task 46 Composite Ranking Ordering](tasks/task-46-composite-ranking-ordering.md) · routed from [todowork](todowork.md)

- [Task 47 Discovery Preferences And Interaction Logging](tasks/task-47-discovery-preferences-and-interaction-logging.md) · routed from [todowork](todowork.md)

- [Task 48 Branch Barber Detail Completeness](tasks/task-48-branch-barber-detail-completeness.md) · routed from [todowork](todowork.md)

- [Task 49 Brand Creation Defaults](tasks/task-49-brand-creation-defaults.md) · routed from [todowork](todowork.md)

- [Task 50 Brand Feature Flags](tasks/task-50-brand-feature-flags.md) · routed from [todowork](todowork.md)

- [Task 51 Branch Storefront Fields](tasks/task-51-branch-storefront-fields.md) · routed from [todowork](todowork.md)

- [Task 52 Settings Preferences Api](tasks/task-52-settings-preferences-api.md) · routed from [todowork](todowork.md)

- [Task 53 Activation Management](tasks/task-53-activation-management.md) · routed from [todowork](todowork.md)

- [Task 54 Barber Profile And Services Api](tasks/task-54-barber-profile-and-services-api.md) · routed from [todowork](todowork.md)

- [Task 55 Affiliation Lifecycle](tasks/task-55-affiliation-lifecycle.md) · routed from [todowork](todowork.md)

- [Task 56 Job Board Completion](tasks/task-56-job-board-completion.md) · routed from [todowork](todowork.md)

- [Task 57 Currency Client Conversion](tasks/task-57-currency-client-conversion.md) · routed from [todowork](todowork.md)

- [Task 58 Client History Completion](tasks/task-58-client-history-completion.md) · routed from [todowork](todowork.md)

- [Task 59 Face Profile Lifecycle](tasks/task-59-face-profile-lifecycle.md) · routed from [todowork](todowork.md)

- [Task 60 Favorites And Saved Filters Contract](tasks/task-60-favorites-and-saved-filters-contract.md) · routed from [todowork](todowork.md)

- [Task 61 Service Catalog Completion](tasks/task-61-service-catalog-completion.md) · routed from [todowork](todowork.md)

- [Task 62 Recommendation Pipeline Fixes](tasks/task-62-recommendation-pipeline-fixes.md) · routed from [todowork](todowork.md)

- [Task 63 Pgvector Storage](tasks/task-63-pgvector-storage.md) · routed from [todowork](todowork.md)

- [Task 64 Status Audit Trail](tasks/task-64-status-audit-trail.md) · routed from [todowork](todowork.md)

- [Task 65 Monetization Analytics Apis](tasks/task-65-monetization-analytics-apis.md) · routed from [todowork](todowork.md)

- [Task 66 Orphan Actions Cleanup](tasks/task-66-orphan-actions-cleanup.md) · routed from [todowork](todowork.md)

- [Task 67 Context Namespacing Conformance](tasks/task-67-context-namespacing-conformance.md) · routed from [todowork](todowork.md)

- [Task 68 Barber Workspace Cache Fix](tasks/task-68-barber-workspace-cache-fix.md) · routed from [todowork](todowork.md)

- [Task 69 Barber Workspace Completion](tasks/task-69-barber-workspace-completion.md) · routed from [todowork](todowork.md)

- [Task 70 Booking Detail And Status](tasks/task-70-booking-detail-and-status.md) · routed from [todowork](todowork.md)

- [Task 71 List Search Filters](tasks/task-71-list-search-filters.md) · routed from [todowork](todowork.md)

- [Task 72 Portal Home And Overview](tasks/task-72-portal-home-and-overview.md) · routed from [todowork](todowork.md)

- [Task 73 Dashboard Token Refresh](tasks/task-73-dashboard-token-refresh.md) · routed from [todowork](todowork.md)

- [Task 74 Branch Operations Bff Ui](tasks/task-74-branch-operations-bff-ui.md) · routed from [todowork](todowork.md)

- [Task 75 Branch People Bff Ui](tasks/task-75-branch-people-bff-ui.md) · routed from [todowork](todowork.md)

- [Task 76 Admin Moderation Ui](tasks/task-76-admin-moderation-ui.md) · routed from [todowork](todowork.md)

- [Task 77 Catalog Brand Management Ui](tasks/task-77-catalog-brand-management-ui.md) · routed from [todowork](todowork.md)

- [Task 78 Client Booking Flow Fixes](tasks/task-78-client-booking-flow-fixes.md) · routed from [todowork](todowork.md)

- [Task 79 Client Barber Discovery](tasks/task-79-client-barber-discovery.md) · routed from [todowork](todowork.md)

- [Task 80 Client Unwired Features](tasks/task-80-client-unwired-features.md) · routed from [todowork](todowork.md)

- [Task 81 Client Auth Cleanup](tasks/task-81-client-auth-cleanup.md) · routed from [todowork](todowork.md)

- [Task 82 Stylist App Shell](tasks/task-82-stylist-app-shell.md) · routed from [todowork](todowork.md)

- [Task 83 Stylist App Features](tasks/task-83-stylist-app-features.md) · routed from [todowork](todowork.md)

- [Task 84 Business App Shell](tasks/task-84-business-app-shell.md) · routed from [todowork](todowork.md)

- [Task 85 Business App Features](tasks/task-85-business-app-features.md) · routed from [todowork](todowork.md)

- [Task 86 Mobile Shared Packages Cleanup](tasks/task-86-mobile-shared-packages-cleanup.md) · routed from [todowork](todowork.md)

- [Task 87 Docs Drift Reconciliation](tasks/task-87-docs-drift-reconciliation.md) · routed from [todowork](todowork.md)

### `docs/`

- [Todowork](todowork.md)

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

### `frontend/mobile/packages/feature_floor_plan/`

- [Agents](../frontend/mobile/packages/feature_floor_plan/AGENTS.md)

- [Changelog](../frontend/mobile/packages/feature_floor_plan/CHANGELOG.md)

- [Claude](../frontend/mobile/packages/feature_floor_plan/CLAUDE.md)

- [Readme](../frontend/mobile/packages/feature_floor_plan/README.md)

### `frontend/mobile/packages/localization/`

- [Agents](../frontend/mobile/packages/localization/AGENTS.md)

- [Changelog](../frontend/mobile/packages/localization/CHANGELOG.md)

- [Claude](../frontend/mobile/packages/localization/CLAUDE.md)

- [Readme](../frontend/mobile/packages/localization/README.md)

### `./`

- [Index](../index.md)
