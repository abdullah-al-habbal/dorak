---
nodeid: dashboard.references.component-and-styling-rules
parentnode: dashboard.guide
childnodes: []
codeanchors:
  - frontend/dashboard/src/
---

# Styling & component rules

Referenced from [`../AGENTS.md`](../AGENTS.md).

## Styling rules

- Use **Tailwind CSS** with the project's **semantic tokens** (`text-text-*`, `bg-card-*`, `border-*`, etc.).
- Never hardcode hex colors — always reference tokens from `src/app/globals.css`.
- Do NOT create new CSS utility classes.
- FullCalendar overrides belong in `src/app/css/calendars.css`.

## Component rules

- **Modular sub-components**: Never place all code into a single monolithic file. Split complex UI into focused, single-responsibility sub-components in separate files (e.g. `header.tsx`, `filter-bar.tsx`, `card-item.tsx`).
- **Follow React composition best practices**:
  - **Single Responsibility**: Keep sub-components focused on one concern—separate container/state logic from presentational rendering.
  - **Composition over prop drilling**: Prefer passing `children` or using compound component patterns over passing deeply nested props through intermediate layers.
  - **Avoid inline render helpers**: Extract repeated or section-level JSX into dedicated sub-component files rather than helper functions like `renderHeader()` inside `index.tsx`.
  - **Typed prop contracts**: Define explicit, strongly typed interfaces for each sub-component in `<name>.types.ts`; only non-exported prop interfaces may stay co-located with the sub-component.
- Prefer primitives from `src/components/tailgrids/core/` (Button, Card, Badge, Select, Tabs, Dialog, etc.) over raw HTML or third-party equivalents.
- Use `react-aria` skill for accessible component architecture when building interactive primitives.
- Icons: use `@tailgrids/icons` for standard controls. For feature-local icons, place them in `icons.tsx`. Never generate SVG icons — use letter placeholders if no icon is available.
- Add `"use client"` directive when the component uses hooks, event handlers, or browser APIs.
