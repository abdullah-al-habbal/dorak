---
nodeid: dashboard.references.type-safety
parentnode: dashboard.guide
childnodes: []
codeanchors:
  - frontend/dashboard/src/
---

# Type safety & code quality

Referenced from [`../AGENTS.md`](../AGENTS.md).

- No explicit `any`. No `as` cast to narrow an external/unknown value (API responses,
  `JSON.parse`, form data) without a runtime guard — validate with `zod` or a type guard
  function first, then trust the narrowed type.
- Every exported function, hook, and component prop has an explicit return/prop type; don't
  rely on inference across a module boundary.
- Extract repeated or section-level JSX into sub-component files rather than inline render
  helpers (see Component rules); keep a module focused — split a file that grows past
  roughly 300 lines or a function past roughly 40 lines.
- Bundle 4+ related function arguments into a typed object from the module's `<name>.types.ts`
  instead of adding more positional parameters.
- No inline magic strings/numbers for statuses, limits, or codes — use the module's
  `<name>.enum.ts` or `<name>.constant.ts` (per the File taxonomy reference), not a literal
  repeated at each call site.
- Wrap an event handler passed down to a child component in `useCallback` so the child's
  memoization (if any) is not defeated by a new function identity each render; keep purely
  local UI state in `useState` or a dedicated hook rather than lifting it unnecessarily.
- Prefer an early return / guard clause over nested `if/else` — return or throw at the top of
  a function for the invalid/edge case, then let the happy path run unindented, to keep
  cyclomatic complexity low.
