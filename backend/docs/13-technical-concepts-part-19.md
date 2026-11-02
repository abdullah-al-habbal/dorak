---
nodeid: backend.13-technical-concepts.part-19
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 19 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-18.md) · [Next](13-technical-concepts-part-20.md)

### Pattern 03: Feature Module Structure

**Backend (per module):**
```
modules/{Module}/
├── Config/
├── Database/Migrations/
├── Enums/
├── Filament/Panels/{Admin|Barber|Branch}/Resources/
├── Http/Actions/{Client|Barber|Shared}/
├── Http/Resources/
├── Models/
├── Routes/Api/V1/
└── Providers/
```

**Flutter (per feature):**
```
lib/Features/{Feature}/
├── Data/
│   ├── {Entity}Dto.dart
│   ├── {Entity}Dto.g.dart
│   └── {Feature}Repository.dart
├── Domain/
│   └── {Entity}Entity.dart
└── Presentation/
    ├── {Feature}Bloc.dart
    ├── Events/
    ├── States/
    ├── {Feature}Screen.dart
    └── Widgets/
```

---
