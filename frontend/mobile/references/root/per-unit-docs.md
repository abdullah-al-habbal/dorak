Referenced from [`../../AGENTS.md`](../../AGENTS.md).

### 1.1 Per-unit docs

Every app and package carries its own pair. **This file and the root
`CLAUDE.md` are the parents** — they hold the rules and facts that apply
everywhere. Each child holds only what is specific to that unit: its dependency
ceiling, the file roles it may use, its public API, and its own gotchas. Where a
child contradicts nothing, the parent still applies.

| Unit | Docs | State |
|---|---|---|
| `apps/client_app` | [`AGENTS`](./apps/client_app/AGENTS.md) · [`CLAUDE`](./apps/client_app/CLAUDE.md) | real features; the reference implementation |
| `apps/business_app` | [`AGENTS`](./apps/business_app/AGENTS.md) · [`CLAUDE`](./apps/business_app/CLAUDE.md) | application shell; feature work remains in Tasks 84–85 |
| `apps/stylist_app` | [`AGENTS`](./apps/stylist_app/AGENTS.md) · [`CLAUDE`](./apps/stylist_app/CLAUDE.md) | application shell; feature work remains in Tasks 82–83 |
| `packages/core` | [`AGENTS`](./packages/core/AGENTS.md) · [`CLAUDE`](./packages/core/CLAUDE.md) | HTTP, config, storage, session, DTOs |
| `packages/design_system` | [`AGENTS`](./packages/design_system/AGENTS.md) · [`CLAUDE`](./packages/design_system/CLAUDE.md) | tokens, theme, fonts, 14 widgets |
| `packages/localization` | [`AGENTS`](./packages/localization/AGENTS.md) · [`CLAUDE`](./packages/localization/CLAUDE.md) | 192 keys, EN + AR |
| `packages/feature_floor_plan` | [`AGENTS`](./packages/feature_floor_plan/AGENTS.md) · [`CLAUDE`](./packages/feature_floor_plan/CLAUDE.md) | empty stub |

Read the child for the unit you are touching **before** editing it. If you touch
two units, read both.

The former zero-byte placeholders under `docs/` have been removed. Use the
[repository documentation graph](../../docs/INDEX.md) for the current file
inventory; a roadmap mention does not mean a document currently exists.

`docs/stitch/exports/` holds the remaining unimplemented screen designs
(010, 015–020 — 011–014 were built and their folders removed): `code.html` is the layout source, `screen.png` the reference, and
`DESIGN.md` is the same global token spec in every folder (already implemented —
do not regenerate tokens from it). Delete an export folder once its screen is
built and the gate is green.

---

