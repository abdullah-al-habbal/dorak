# Worked Refactors From This Codebase

Real cases found in `modules/` on 2026-08-22, with the framework-native alternative. File
paths are accurate as of that date; verify before editing.

These are **illustrations of the rules**, not a work order. Do not refactor a file you are not
otherwise touching.

---

## 1. Foreign-key duplication → `whereBelongsTo()`

`modules/Currency/Eloquent/Resolvers/Shared/ConvertCurrencyEloquentResolver.php:29`

```php
// Before
$rate = ExchangeRateModel::where('from_currency_id', $fromCurrency->id)
    ->where('to_currency_id', $toCurrency->id)
    ->first();
```

```php
// After — requires fromCurrency()/toCurrency() belongsTo relations on ExchangeRateModel
$rate = ExchangeRateModel::query()
    ->whereBelongsTo($fromCurrency, 'fromCurrency')
    ->whereBelongsTo($toCurrency, 'toCurrency')
    ->first();
```

The relationship name is mandatory here: two relations point at the same model, so Eloquent
cannot infer which foreign key you mean. If those relations do not exist yet, **declare them
first** — `whereBelongsTo()` on an undeclared relation throws
`RelationNotFoundException`.

---

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

`wasRecentlyCreated` distinguishes the two outcomes without a second query.
`firstOrCreate()` alone is still not race-proof — the index is what makes it safe, and
`UniqueConstraintViolationException` is the path to handle if you keep the explicit branch.

`modules/BarberAffiliation/Eloquent/Resolvers/Barber/CreateAffiliationEloquentResolver.php:18`
has the same shape (`exists()` → `create()`), also with no unique index on
`barber_affiliations`. It additionally assigns the morph columns by hand:

```php
// Before
BarberAffiliationModel::create([
    'barber_id' => $barber->id,
    'affiliable_id' => $command->affiliableId,
    'affiliable_type' => $command->affiliableType,
    // ...
]);
```

`BarberAffiliationModel` declares `barber(): BelongsTo` and `affiliable(): MorphTo`
(`:47`, `:52`), so the child side already has the relationships. `BarberModel` has no
`affiliations()` relation yet (it declares `activationLogs`, `bans`, `services`, `reviews`,
`bookings`), so declare the inverse first:

```php
// BarberModel
public function affiliations(): HasMany
{
    return $this->hasMany(BarberAffiliationModel::class, 'barber_id');
}
```

Then the relationship API can own both sides, including the morph:

```php
// After
$affiliation = $barber->affiliations()->make([
    'commission_rate' => $command->commissionRate,
    'status' => AffiliationStatus::Pending,
    'invited_at' => now(),
]);

$affiliation->affiliable()->associate($affiliable);
$affiliation->save();
```

`associate()` sets both `affiliable_id` and `affiliable_type` from the model's morph class —
no hand-assigned type string, and no drift if a morph map is added later. The existence check
becomes `->whereBelongsTo($barber)`.

Note this requires the `$affiliable` **model**, not the raw `affiliableId` /
`affiliableType` strings the Command currently carries. If resolving that model is not
worthwhile here, keep the explicit columns — passing an id and a type string into
`associate()` is not possible, and faking it defeats the point.

---

## 4. Repeated query in one execution → relationship + load once

`modules/ClientRecommendation/Console/Commands/RecomputeClientVectorsCommand.php:212` and `:236`

```php
// Before — the identical query runs twice per client, in two private methods
$favorites = ClientFavoriteModel::where('client_id', $client->id)->get();
```

`ClientModel` declares `bans()`, `socialAccounts()`, and `bookings()` but **no** `favorites()`
relation. Declare it, then load once:

```php
// ClientModel
public function favorites(): HasMany
{
    return $this->hasMany(ClientFavoriteModel::class, 'client_id');
}
```

```php
// Command — load once, pass the collection to both steps
$client->loadMissing('favorites');

$signals = $this->gatherSignals($client);   // uses $client->favorites
$this->rebuildEdges($client);               // uses $client->favorites
```

The same command already does the right thing for bookings —
`$client->bookings()->with('barber', 'services.catalogItem')->get()` — which is the pattern to
copy.

If the command iterates all clients, it should stream rather than `get()` them:

```php
ClientModel::query()->lazyById()->each(fn (ClientModel $client) => $this->recompute($client));
```

---

## 5. Justified raw SQL — leave it, but bind

`modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php:24`

Haversine distance has no Eloquent predicate, and wrapping it in `fromSub()` so `distance`
becomes filterable and sortable is exactly the right move. This is a **correct** exception to
the rules, not a violation.

The one improvement: coordinates go in through `sprintf('%f', ...)` rather than bindings.
`%f` coercion makes it safe today, but it is a pattern the next author will copy with a string
value. New raw SQL binds:

```php
->selectRaw(
    '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) '
    . '* cos(radians(longitude) - radians(?)) '
    . '+ sin(radians(?)) * sin(radians(latitude)))) AS distance',
    [$payload->latitude, $payload->longitude, $payload->latitude],
)
```

---

## 6. Not every column pair is a morph

Same file, further down:

```php
$edgeWeights = RecommendationEdgeModel::where('source_type', 'client')
    ->where('source_id', $payload->clientId)
    ->where('target_type', 'barber')
    ->whereIn('target_id', $barberIds)
    ->pluck('weight', 'target_id');
```

This *looks* like the `whereMorphedTo()` case from
`references/eloquent-relationships.md`, but it is not: `source_type` and `target_type` hold
domain strings (`'client'`, `'barber'`), not morph class names or morph-map aliases.
`whereMorphedTo()` would resolve `$model->getMorphClass()` and match nothing.

Two honest options — pick based on whether these really are polymorphic references:

1. They are morphs: register a morph map (`'client' => ClientModel::class`), declare
   `source()` / `target()` as `MorphTo`, then `whereMorphedTo()` applies.
2. They are not morphs, just typed edge endpoints: keep the explicit `where` clauses and move
   them into a named query scope (`scopeBetween(...)`) so the four-clause pattern is written
   once.

This is the guard rail in practice: match the API to the data model, not to the shape of the
code. Reaching for `whereMorphedTo()` here would be a fashionable, silently-wrong change.
