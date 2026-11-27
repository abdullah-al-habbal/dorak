---
nodeid: mobile.docs
parentnode: mobile.guide
childnodes:
  - mobile.architecture
  - mobile.authentication.auth-flow
  - mobile.authentication.password-recovery
  - mobile.core.exceptions
  - mobile.core.interceptors
  - mobile.core.networking
  - mobile.core.result-state
  - mobile.core.session
  - mobile.core.storage
  - mobile.design-system
  - mobile.feature-index
  - mobile.flows.app-launch
  - mobile.flows.guest-access
  - mobile.flows.onboarding
  - mobile.future-features.per-page.per-page
  - mobile.navigation.guards
  - mobile.navigation.routes
  - mobile.realtime.reverb
  - mobile.runtime.app-lifecycle
  - mobile.screens.authentication.create-new-password
  - mobile.screens.authentication.forgot-password
  - mobile.screens.authentication.password-reset-success
  - mobile.screens.authentication.recovery-otp
  - mobile.state-management
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

# Dorak mobile documentation

Repository routes: [mobile guide](../AGENTS.md) · [documentation graph](../../../docs/index.md).

What was built is in the [feature index](feature-index.md); open work is in the [backlog](../../../docs/backlog/index.md).
Gates are in the [mobile guide](../AGENTS.md).

- Architecture: [state rules](architecture.md), [coding conventions](architecture/coding-conventions.md) and the
  decisions on [bloc in core](architecture/decisions/0001-bloc-in-core.md) and
  [go_router in the design system](architecture/decisions/0002-design-system-go-router.md).
- Core runtime: [networking](core/networking.md), [interceptors](core/interceptors.md), [session](core/session.md),
  [storage](core/storage.md), [exceptions](core/exceptions.md), [result state](core/result-state.md),
  [runtime lifecycle](runtime/app-lifecycle.md) and [realtime](realtime/reverb.md).
- State and navigation: [state management](state-management/index.md), [routes](navigation/routes.md) and
  [guards](navigation/guards.md).
- Product flows: [authentication](authentication/auth-flow.md),
  [password recovery](authentication/password-recovery.md), [app launch](flows/app-launch.md),
  [onboarding](flows/onboarding.md) and [guest access](flows/guest-access.md).
- Design: [design system](design-system/index.md) and the
  [password recovery screens](screens/authentication/forgot-password.md).
