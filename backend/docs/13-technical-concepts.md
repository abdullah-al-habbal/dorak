---
nodeid: backend.13-technical-concepts
parentnode: backend.docs
childnodes:
  - backend.13-technical-concepts.group-1
codeanchors:
  - backend/modules/
---

# 13 — Technical Concepts: Mandatory Reference

> Read this before implementing a feature. It states patterns to apply, not what is built, and its code samples are
> illustrative. What exists is in the code and the [feature index](feature-index.md).

---

## PART 1: CRUD CONCEPTS

### Concept 01: Optimistic vs Pessimistic Updates

**Rule:** Decide *when* the UI updates — before or after server confirmation.

| Aspect | Optimistic | Pessimistic |
|--------|------------|-------------|
| **Flow** | Click → UI updates instantly → Request sent in background → Fail? Roll back | Click → Request sent → UI waits (loader) → UI updates after confirmation |
| **User Experience** | Feels instant | Feels safe |
| **Use For** | Low-risk actions (likes, follows, reactions) | Critical actions (payments, bookings, deletions) |

**Flutter Implementation:**

Optimistic (BLoC):
```dart
// In BLoC — emit new state immediately, send request in background
on<ToggleFavorite>((event, emit) {
  final previousState = state;
  emit(state.copyWith(isFavorite: !state.isFavorite)); // instant UI update
  _repository.toggleFavorite(event.id).catchError((error) {
    add(FavoriteError(previousState: previousState)); // rollback on failure
  });
});
```

Pessimistic (BLoC):
```dart
// In BLoC — emit loading, wait for response, then emit result
on<CreateBooking>((event, emit) async {
  emit(state.copyWith(isLoading: true));
  final result = await _repository.createBooking(event.data);
  result.fold(
    (error) => emit(state.copyWith(isLoading: false, error: error)),
    (booking) => emit(state.copyWith(isLoading: false, booking: booking)),
  );
});
```

**Laravel Implementation:**

## Continued in

- [Parts 2-19](13-technical-concepts-group-1.md)
