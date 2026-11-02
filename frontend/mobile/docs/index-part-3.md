---
nodeid: mobile.docs.part-3
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 3 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index-part-2.md) · [Next](index-part-4.md)

## 3. Repository Architecture

```text
frontend/mobile/
├── apps/
│   ├── client_app/
│   ├── business_app/
│   └── stylist_app/
│
├── packages/
│   ├── design_system/
│   ├── localization/
│   └── core/
│
├── docs/
└── CLAUDE.md
```

Dependency direction:

```text
apps/*
   ↓
feature packages
   ↓
core / design_system / localization
```

Rules:

* `design_system` MUST NOT depend on `core`.
* `localization` MUST remain independently reusable.
* `core` MUST NOT depend on application-specific code.
* Feature packages may depend on `design_system`, `core`, and `localization`.
* Applications may depend on the permitted local packages.
* Shared packages MUST NOT import executable application code.

See:

* `docs/architecture/system_overview.md`
* `docs/architecture/dependency_rules.md`
* `docs/architecture/package_boundaries.md`

---
