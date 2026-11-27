---
codeanchors:
  - backend/modules/
---

Part 17 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-16.md) · [Next](13-technical-concepts-part-18.md)

### Concept 10: Client-Side Cache Invalidation

**Rule:** After a mutation (create/update/delete), you must explicitly refresh the cached data — otherwise stale data persists.

**Flutter Implementation:**

```dart
// BLoC — after successful mutation, refetch the list
on<DeleteService>((event, emit) async {
  final result = await _repository.deleteService(event.serviceId);
  result.fold(
    (error) => emit(state.copyWith(error: error)),
    (_) {
      // Invalidate cache — refetch the list
      add(LoadServices());
    },
  );
});

// Repository — caching layer
class ServiceRepository {
  List<ServiceCatalogItem>? _cache;

  Future<List<ServiceCatalogItem>> getServices() async {
    if (_cache != null) return _cache!;
    final data = await _fetchFromApi();
    _cache = data;
    return data;
  }

  void invalidateCache() {
    _cache = null;
  }
}
```

---
