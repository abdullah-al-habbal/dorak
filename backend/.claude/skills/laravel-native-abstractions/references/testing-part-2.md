---
nodeid: skills.backend.laravel-native-abstractions.references.testing.part-2
parentnode: skills.backend.laravel-native-abstractions.references.testing
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [Testing Laravel Abstractions](testing.md) · [Previous](testing.md) · [Next](testing-part-3.md)

## Database assertions

```php
$this->assertDatabaseHas('bookings', [
    'id' => $booking->id,
    'status' => BookingStatusEnum::Confirmed->value,
]);

$this->assertDatabaseMissing('bookings', ['id' => $stale->id]);
$this->assertDatabaseCount('bookings', 3);
$this->assertModelExists($booking);
$this->assertModelMissing($deleted);
$this->assertSoftDeleted($booking);
$this->assertNotSoftDeleted($booking);
```

Do not hand-write `DB::select(...)` and compare rows. Note the `->value` on enum columns —
these assertions compare raw database values, not casts.

---

## HTTP / feature assertions

Use the response assertion API rather than decoding JSON by hand:

```php
$this->postJson('/api/v1/bookings', $payload)
    ->assertCreated()
    ->assertJsonPath('data.status', BookingStatusEnum::Pending->value)
    ->assertJsonStructure(['success', 'statusCode', 'code', 'message', 'data'])
    ->assertJsonCount(2, 'data.items');
```

`assertOk()`, `assertCreated()`, `assertUnprocessable()`, `assertForbidden()`,
`assertUnauthorized()`, `assertNotFound()`, `assertJsonValidationErrors()`,
`assertJsonMissingPath()`. The envelope shape itself is owned by `api-response-standard`.

---
