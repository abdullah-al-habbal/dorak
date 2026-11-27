---
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

**<Task NN> is done and committed locally as `<sha>`.** Nothing was pushed.

**Decisions / inconsistencies**
- <decision recorded, or spec/guide mismatch found and how it was resolved or escalated>

**What changed**
- Backend: <...>
- API contract: <...>
- Dashboard: <...>
- Mobile (client_app / business_app / stylist_app / packages): <...>
- Docs: <...>
- Unchanged on purpose: <layer: reason>

**Gates**
| Gate | Command | Result |
| --- | --- | --- |
| Backend tests | `<cmd>` | <n passed> |
| Pint | `<cmd>` | <clean / pre-existing findings listed below> |
| Dashboard | lint, typecheck, test, build | <result, counts> |
| Mobile | `dart run melos run verify` | <result> |
| Security review | `security-audit` guidance mode on the diff | <surfaces and companion files checked, findings; or not applicable: reason> |

**Pre-existing findings (not mine):** <list or none>
**Not done / out of scope:** <list or none>
