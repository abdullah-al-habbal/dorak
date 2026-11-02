---
name: filament-module-structure
description: "Filament resource and page placement per module: panels, providers and module structure."
nodeid: skills.backend.filament-module-structure
parentnode: skills.backend
childnodes:
  - skills.backend.filament-module-structure.part-2
codeanchors:
  - backend/modules/
---

# Filament Module Structure

## Panels
3 panels, each defined by a provider in `modules/Core/Providers/Filament/`:

| Provider | Panel ID | Path | Guard | Discovers from |
|---|---|---|---|---|
| `AdminPanelProvider` | `admin` | `/admin` | `admin` | `modules/*/Filament/Panels/Admin/` |
| `BarberPanelProvider` | `barber` | `/barber` | `barber_dashboard` | `modules/*/Filament/Panels/Barber/` |
| `BranchPanelProvider` | `branch` | `/branch` | `branch` | `modules/*/Filament/Panels/Branch/` |

Discovery is dynamic: each provider scans `modules/` directories and registers any `Filament/Panels/{PanelName}/Resources|Pages|Widgets` it finds.

## Per-module resource tree
```
modules/{Module}/
└── Filament/
    └── Panels/
        ├── Admin/
        │   └── Resources/
        │       └── {Name}/
        │           ├── {Name}Resource.php
        │           ├── Pages/
        │           │   ├── Create{Name}Page.php
        │           │   ├── Edit{Name}Page.php
        │           │   ├── List{Name}sPage.php
        │           │   └── View{Name}Page.php (optional)
        │           ├── Schemas/
        │           │   ├── {Name}FormSchema.php
        │           │   └── {Name}InfolistSchema.php
        │           └── Tables/
        │               └── {Name}sTable.php
        └── Barber/ or Branch/
            └── Resources/
                └── ... (same structure)
```

## Naming conventions
- Resource class ends with `Resource`, directory name matches (no suffix stripping)
- Page classes: `Create{Name}Page`, `Edit{Name}Page`, `List{Name}sPage`
- Form schema: `{Name}FormSchema`
- Table class: `{Name}sTable`
- All classes use `declare(strict_types=1)` and are `final` where possible

## Admin panel resources
- Full CRUD (List, Create, Edit, View)
- BarberResource and BranchResource include `ToggleActivationAction` in action bar
- Show `status` column with badges (pending/enabled/disabled for activatable entities)
- Show `isBanned()` indicator on ClientResource

## Continued in

- [Part 2: Barber panel resources](references/skill-part-2.md)
