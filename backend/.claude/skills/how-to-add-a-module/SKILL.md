---
name: how-to-add-a-module
description: "Step-by-step guide to scaffold a new module: directory structure, service provider, route wiring, bootstrap registration. Use whenever creating a new domain module."
nodeid: skills.backend.how-to-add-a-module
parentnode: skills.backend
childnodes:
  - skills.backend.how-to-add-a-module.part-2
codeanchors:
  - backend/modules/
---

# How to add a new module

## 1. Create directory structure

```
modules/{ModuleName}/
├── Config/
├── Console/Commands/
├── CQRS/
│   ├── Command/
│   └── Query/
├── Database/
│   ├── Factories/
│   ├── Migrations/
│   └── Seeders/
├── Eloquent/Resolvers/
├── Enums/
├── Handlers/
├── Http/
│   ├── Actions/
│   ├── Middleware/
│   └── Requests/
├── Models/
├── Providers/
├── Routes/
│   ├── Api/
│   └── Web/
├── Services/
├── ValuesObjects/
└── lang/
    ├── en/
    └── ar/
```

Module name must be PascalCase, singular.

## Continued in

- [Part 2: 2. Create service provider](references/skill-part-2.md)
