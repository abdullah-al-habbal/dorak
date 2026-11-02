---
nodeid: skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-3
parentnode: skills.backend.laravel-native-abstractions.examples.dorak-refactors
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 6 · [Worked Refactors From This Codebase](dorak-refactors.md) · [Previous](dorak-refactors-part-2.md) · [Next](dorak-refactors-part-4.md)

**And the part scoped bindings do not fix:** `where('branch_id', $branch->id)` was carrying the
access rule. A scoped binding guarantees the chair belongs to the branch **in the URL** — it
does not decide whether the authenticated actor may act on that branch. Today that gap is
covered only by the `branch_api` guard. When this endpoint is touched, add a `ChairPolicy` and
`->can('update', 'chair')`. See `references/requests-validation-authorization.md`.

---

## 3. Exists-then-create race → `firstOrCreate()` + a unique index

`modules/JobPosting/Eloquent/Resolvers/Barber/ApplyForJobEloquentResolver.php:24`

```php
// Before
$existing = ApplicationModel::where('job_posting_id', $jobPosting->id)
    ->where('barber_id', $command->barberId)
    ->exists();

if ($existing) {
    return ApplyForJobResult::alreadyApplied();
}

$application = ApplicationModel::create([...]);
```

Two concurrent taps on "Apply" both pass `exists()` and both insert.
`modules/JobPosting/Database/Migrations/0001_01_01_200081_create_job_applications_table.php`
has **no unique index** on `(job_posting_id, barber_id)`, so nothing stops the duplicate.

```php
// After — migration first; the database is the authority
$table->unique(['job_posting_id', 'barber_id']);
```

```php
// Then express the intent, and let the constraint decide
$application = ApplicationModel::query()->firstOrCreate(
    [
        'job_posting_id' => $jobPosting->getKey(),
        'barber_id' => $command->barberId,
    ],
    [
        'profile_snapshot' => [...],
        'status' => ApplicationStatus::Submitted->value,
    ],
);

return $application->wasRecentlyCreated
    ? ApplyForJobResult::success($application)
    : ApplyForJobResult::alreadyApplied();
```
