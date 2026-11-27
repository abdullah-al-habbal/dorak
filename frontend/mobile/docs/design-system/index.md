---
nodeid: mobile.design-system
parentnode: mobile.docs
childnodes:
  - mobile.design-system.components.loading.button
  - mobile.design-system.components.loading.fullscreen
  - mobile.design-system.components.loading.inline
  - mobile.design-system.components.shimmer.text
  - mobile.design-system.states.authentication-required
  - mobile.design-system.states.empty
  - mobile.design-system.states.network-error
  - mobile.design-system.states.offline
  - mobile.design-system.states.retry
  - mobile.design-system.states.session-expired
  - mobile.design-system.part-2
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# Design System — States & Loading Components

Track 12 (Global UI States). See `docs/index.md` §Track 12.

## The no-strings rule

`design_system` must never resolve a string ([mobile guide](../../AGENTS.md#layers)). Every state
component takes its copy as constructor parameters; the app layer supplies ARB
strings (`localization`) and picks the component from bloc state.

## Component map

| Component | Covers | API |
|---|---|---|
| `StatusView` | empty · error · offline · retry (as `onAction`) | `icon`, `title`, `message?`, `actionLabel?`, `onAction?`, `iconColor?` |
| `StatusBanner` | compact inline error/message row | `message`, `color?`, `actionLabel?`, `onAction?` |
| `AppLoader.page()` | full-page loading | 32px centred, expands |
| `AppLoader.inline()` | inline loading (list footers) | `size` default 20 |
| `ShimmerBox` | shimmer skeleton primitive | `width`, `height`, `borderRadius?` |
| `PrimaryButton.isLoading` | button loading | `isLoading` flag |
| `RefreshIndicator` / `SnackBar` | refresh + transient failure | framework, no wrapper |

**Retry is an action, not a state.** No `RetryButton` widget exists — retry is
`actionLabel` + `onAction` on `StatusView` / `StatusBanner`.

## Filled state docs

- [`states/empty.md`](./states/empty.md)
- [`states/network-error.md`](./states/network-error.md)
- [`states/offline.md`](./states/offline.md)
- [`states/retry.md`](./states/retry.md)
- [`states/session-expired.md`](./states/session-expired.md)
- [`states/authentication-required.md`](./states/authentication-required.md)
- [`components/loading/fullscreen.md`](./components/loading/fullscreen.md)
- [`components/loading/inline.md`](./components/loading/inline.md)
- [`components/loading/button.md`](./components/loading/button.md)
- [`components/shimmer/text.md`](./components/shimmer/text.md)

## Continued in

- [Part 2: Deliberately empty](index-part-2.md)
