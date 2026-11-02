---
nodeid: mobile.design-system.components.loading.fullscreen
parentnode: mobile.design-system
childnodes: []
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# Full-Screen Loading

Component: `AppLoader.page()`

```dart
AppLoader.page()
```

A 32px `CircularProgressIndicator` centred in the available space (expands to
fill). Use for `Paged<T>.isFirstLoad` full-page skeletons, or
`ShimmerBox`-based skeletons where the layout matters.

Takes no strings and no tokens at the call site — the colour is
`colors.primary` internally.