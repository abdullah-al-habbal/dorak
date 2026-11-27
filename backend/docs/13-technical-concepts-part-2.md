---
codeanchors:
  - backend/modules/
---

Part 2 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts.md) · [Next](13-technical-concepts-part-3.md)

Handler-level decision — no special middleware needed. The Action/Handler pattern already supports both:
```php
// Pessimistic: validate, process, return result (current pattern)
final class CreateBookingHandler
{
    public function handle(CreateBookingCommand $command): CreateBookingResult
    {
        // validation, processing, all before response
    }
}
```

---

### Concept 02: Version Locking

**Rule:** Every record carries a version number. Server only accepts a write if the version still matches — otherwise it's rejected.

**Key Points:**
- Prevents silent data loss when two users edit the same record simultaneously
- Rejected writes indicate **stale data** → refetch and let the user retry
- Example: Record #482 (version 3) → User A updates → version becomes 4 → User B's update with version 3 is rejected

In this repository only `branch_products` has a `version` column (`ProductCatalog` module); the sample below uses
`barbers` as an illustration.

**Laravel Implementation:**

Migration:
```php
Schema::table('barbers', function (Blueprint $table) {
    $table->unsignedInteger('version')->default(1);
});
```

Handler:
```php
final class UpdateBarberProfileHandler
{
    public function handle(UpdateBarberProfileCommand $command): void
    {
        $barber = BarberModel::findOrFail($command->barberId);

        if ($barber->version !== $command->expectedVersion) {
            throw new StaleDataException('Record was modified by another user. Please refresh and retry.');
        }

        $barber->update([
            ...$command->data,
            'version' => $barber->version + 1,
        ]);
    }
}
```

**Flutter Implementation:**
