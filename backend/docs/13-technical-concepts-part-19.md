---
nodeid: backend.13-technical-concepts.part-19
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 19 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-18.md)

### Pattern 03: Feature Module Structure

**Backend (per module):**
```
modules/{Module}/
├── Config/
├── Database/Migrations/
├── Enums/
├── Http/Actions/{Client|Barber|Shared}/
├── Http/Resources/
├── Models/
├── Routes/Api/V1/
└── Providers/
```

**Flutter:** the layout and file names are set by the [mobile guide](../../frontend/mobile/AGENTS.md).

---
