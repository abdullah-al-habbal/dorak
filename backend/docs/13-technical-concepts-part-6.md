---
codeanchors:
  - backend/modules/
---

Part 6 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-5.md) · [Next](13-technical-concepts-part-7.md)

### Concept 06: Race Conditions in Read

**Rule:** When a user types fast, your app fires off multiple requests. An **older request can arrive after a newer one** — silently overwriting the correct result with stale data.

**Problem:**
- User types "la" → sent → arrives 900ms
- User types "laptop" → sent → arrives 250ms
- Result: "laptop" shows first, then gets overwritten by slower "la" response

**Flutter Implementation:**

```dart
// BLoC — request counter to ignore stale responses
int _searchRequestId = 0;

on<SearchBarbers>((event, emit) async {
  final requestId = ++_searchRequestId;
  emit(state.copyWith(isSearching: true));

  final results = await _repository.search(event.query);

  // Only update if this is still the latest request
  if (requestId == _searchRequestId) {
    emit(state.copyWith(isSearching: false, results: results));
  }
  // Otherwise, discard — a newer request is in flight
});
```

---

### Concept 07: Batch Operations

**Rule:** Instead of firing one network request per item, batching combines many Create/Update/Delete actions into a **single request**.

**Comparison:**
```
ONE-BY-ONE (N+1)            BATCH REQUEST
for (item of items) {        POST /items/batch-update
  await api.update(item)     {
}                              updates: [ ...100 items ]
                             }
100 items = 100 requests     100 items = 1 request
```

**Laravel Implementation:**
