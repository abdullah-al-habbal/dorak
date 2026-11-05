---
nodeid: archive.legacy_dashboard.references.file-taxonomy
parentnode: archive.legacy_dashboard.guide
childnodes: []
codeanchors:
  - archive/frontend/legacy-dashboard/src/
---

# File taxonomy

Referenced from [`../AGENTS.md`](../AGENTS.md).

Enforced for `src/` (except `components/tailgrids/core/` and `*.d.ts`) by `tests/workspace-conventions.test.ts`:

- Enums: `<name>.enum.ts` — prefer `as const` arrays + derived unions; no `enum` elsewhere.
- Constants: `<name>.constant.ts` — every exported `SCREAMING_CASE` value; nothing callable.
- Types / interfaces: `<name>.types.ts` — every exported `type`/`interface`; no runtime exports.
- Hooks: `src/hooks/use-<name>.ts` — exactly one exported hook per file, file name = hook name.
- Utilities: `<name>.util.ts` — pure helpers, guards, mappers, formatters.
- Data access: reads in `<name>.query.ts`, writes in `<name>.mutation.ts`; never mix them in one module. Client hooks wrap them one per file (`use-login-mutation.ts`).
- React contexts live in their own `*-context.ts`; providers render, hooks consume.
- No bare catch-all names (`types.ts`, `constants.ts`, `utils.ts`, `helpers.ts`).
- Next.js special files (`page`, `layout`, `route`, `error`, `loading`, `not-found`, `proxy`) keep framework names.
