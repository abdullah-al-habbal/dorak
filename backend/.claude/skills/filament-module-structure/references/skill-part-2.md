---
nodeid: skills.backend.filament-module-structure.part-2
parentnode: skills.backend.filament-module-structure
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [Filament Module Structure](../SKILL.md) · [Previous](../SKILL.md)

## Barber panel resources
- Scoped via `ScopePanelToCurrentUser` middleware — all queries automatically filter to the authenticated barber
- Resources are typically read-only (profile view, own services, own bookings, own reviews)
- Override `getEloquentQuery()` only if middleware scoping is insufficient

## Branch panel resources
- Scoped via same middleware — queries filter to the authenticated branch
- Branch-specific resources: chairs, services, affiliations, bookings, jobs, applications
- Same middleware patterns as barber panel

## Activation action
`ToggleActivationAction` lives in `modules/Activation/Filament/Actions/ToggleActivationAction.php`.
Use from any resource:
```php
ToggleActivationAction::make('toggle')
```
It creates an `ActivationLogModel` record and triggers the observer to sync entity status.

## Scoping middleware behavior

Registered only on Barber and Branch panels (not Admin).

**Barber panel scopes:**
- `BarberModel` → `whereKey(auth()->id())`
- `BookingModel` → `where('barber_id', auth()->id())`
- `OfferedServiceModel` → `where('serviceable_id', auth()->id())->where('serviceable_type', 'barber')`
- `ReviewModel` → `whereHas('booking', fn => where('barber_id', auth()->id()))`

**Branch panel scopes:**
- `BranchModel` → `whereKey(auth()->id())`
- `ChairModel` → `where('branch_id', auth()->id())`
- `BookingModel` → `whereHas('chair', fn => where('branch_id', auth()->id()))`
- `OfferedServiceModel` → `where('serviceable_id', auth()->id())->where('serviceable_type', 'branch')`
- `JobPostingModel` → `where('branch_id', auth()->id())`
- `ReviewModel` → `whereHas('booking.chair', fn => where('branch_id', auth()->id()))`
