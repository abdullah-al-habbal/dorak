---
codeanchors:
  - backend/modules/
---

Part 2 of 6 · [Worked Refactors From This Codebase](dorak-refactors.md) · [Previous](dorak-refactors.md) · [Next](dorak-refactors-part-3.md)

## 2. Route-scoped lookup → scoped binding (and a missing policy)

`modules/Branch/Http/Actions/Branch/ToggleChairStatusAction.php:20`

```php
// Before
public function __invoke(Request $request, string $chair): JsonResponse
{
    $branch = $request->user('branch_api');
    $chairModel = ChairModel::where('branch_id', $branch->id)->findOrFail($chair);

    $validated = $request->validate([
        'status' => ['required', 'string', 'in:available,occupied,maintenance'],
    ]);

    $status = ChairStatus::from($validated['status']);
    $chairModel->update(['status' => $status]);
    // ...
    'status' => $chairModel->fresh()->status->value,
```

Four separate issues:

**a. The scoped lookup.** `ChairModel` already declares `branch(): BelongsTo`
(`modules/Chair/Models/ChairModel.php:35`), so at minimum this is
`ChairModel::query()->whereBelongsTo($branch)->findOrFail($chair)`. Better: let the router do
it with a scoped binding, and type the parameter.

**b. The validation rule duplicates the enum.** `in:available,occupied,maintenance` is a hand-
maintained copy of `ChairStatus`. Add a case to the enum and this rule silently rejects it.

**c. Validation belongs in a Form Request** feeding a Command object — see `cqrs-pattern` and
`10StrictBackendArchitecture`.

**d. `->fresh()` is an extra SELECT.** After `update()` the attribute is already set on the
model.

```php
// After
// routes: Route::patch('/branches/{branch}/chairs/{chair}', ToggleChairStatusAction::class)
//     ->scopeBindings();

public function __invoke(ToggleChairStatusRequest $request, BranchModel $branch, ChairModel $chair): JsonResponse
{
    $status = $request->enum('status', ChairStatus::class);

    $chair->update(['status' => $status]);

    ChairStatusUpdated::dispatch($chair->id, $branch->id, $status->value);

    return $this->success(
        data: ['id' => $chair->id, 'label' => $chair->label, 'status' => $chair->status->value],
        code: SuccessCodeEnum::UPDATED,
    );
}

// ToggleChairStatusRequest::rules()
return ['status' => ['required', Rule::enum(ChairStatus::class)]];
```
