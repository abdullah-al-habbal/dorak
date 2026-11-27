---
codeanchors:
  - backend/modules/
---

Part 5 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-4.md) · [Next](13-technical-concepts-part-6.md)

### Concept 05: PATCH vs PUT

**Rule:** Both update an existing resource, but differently. **PUT** replaces the entire object — you must send every field. **PATCH** updates only the fields included in the request.

| Feature | PUT | PATCH |
|---------|-----|-------|
| **Action** | Replaces the entire object | Updates only included fields |
| **Requirement** | Must send every field | Send only changed fields |
| **Risk** | Missing a field wipes it out | Removes that risk entirely |

**Laravel Implementation:**

```php
// PATCH — partial update (preferred for mobile)
Route::patch('/barber/profile', UpdateBarberProfileAction::class);

// PUT — full replacement (admin panel)
Route::put('/admin/barbers/{barber}', AdminUpdateBarberAction::class);
```

Handler for PATCH:
```php
final class UpdateBarberProfileHandler
{
    public function handle(UpdateBarberProfileCommand $command): void
    {
        $barber = BarberModel::findOrFail($command->barberId);

        // Only update fields that were sent
        $updates = array_filter($command->data, fn ($v) => $v !== null);
        $barber->update($updates);
    }
}
```

**Flutter Implementation:**

```dart
// Repository — PATCH with only changed fields
Future<void> updateProfile({String? name, String? email}) async {
  final data = <String, dynamic>{};
  if (name != null) data['name'] = name;
  if (email != null) data['email'] = email;
  if (data.isEmpty) return; // nothing to update

  await _dio.patch('/barber/profile', data: data);
}
```

---
