# Archive

Read-only history. Nothing here is built, tested, linted, deployed or referenced by a
quality gate, and nothing here should be edited.

| Path | What it was | Replaced by |
| --- | --- | --- |
| `frontend/legacy-dashboard/` | The first Next.js dashboard (admin, manager and barber portals), archived on 2026-11-05. | [`frontend/web/new-dashboard/`](../frontend/web/new-dashboard/README.md), the only active dashboard. |

To restore it, move the folder back to `frontend/dashboard` and revert the archive
commit. Its `node_modules` and `.next` output are intentionally ignored by Git.
