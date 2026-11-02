---
nodeid: skills.repo.monorepo-task-executor.templates.implemented-contract
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

<!-- Append under the Full-Stack Scope of the relevant doc -->
### Implemented contract
- Shared code path: `<Class::method()>`, used by `<route/handler 1>`, `<route/handler 2>`, `<route/handler 3>`.
- Scope of the rule: <predicate / statuses / when it applies and when it does not>.
- Request: <new or changed fields, validation>.
- Failure: HTTP <status>, `code = <CODE>`, `errors = <shape>`; <state left unchanged>.
- Success: HTTP <status>, `<data|meta>.<field>` = <shape>; <side effects: jobs, events, DB state>.
- Dashboard: <component/file>. Mobile: <app/package/file>. Docs: <files updated>.
- Deviations from the original spec text: <list, with reason>.
