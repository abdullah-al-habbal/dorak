---
nodeid: backend.13-technical-concepts.part-7
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 7 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-6.md) · [Next](13-technical-concepts-part-8.md)

```php
final class BatchUpdateChairsHandler
{
    public function handle(BatchUpdateChairsCommand $command): void
    {
        DB::transaction(function () use ($command) {
            foreach ($command->updates as $update) {
                ChairModel::where('id', $update['id'])->update($update['data']);
            }
        });
    }
}
```

**Flutter Implementation:**

```dart
// Repository — single batch call
Future<void> batchUpdateChairs(List<ChairUpdate> updates) async {
  await _dio.post('/branch/chairs/batch', data: {
    'updates': updates.map((u) => u.toJson()).toList(),
  });
}
```

---
