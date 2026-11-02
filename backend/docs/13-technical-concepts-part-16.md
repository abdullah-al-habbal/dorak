---
nodeid: backend.13-technical-concepts.part-16
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 16 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-15.md) · [Next](13-technical-concepts-part-17.md)

### Concept 08: List Virtualization

**Rule:** Rendering thousands of widgets at once freezes the app. `ListView.builder` only renders visible items.

**Flutter Implementation:**

```dart
// CORRECT — virtualized (lazy) list
ListView.builder(
  itemCount: branches.length,
  itemBuilder: (context, index) => BranchCard(branch: branches[index]),
)

// WRONG — renders ALL items at once
ListView(
  children: branches.map((b) => BranchCard(branch: b)).toList(),
)
```

**Rule:** Always use `ListView.builder` for API data. `ListView(children: [...])` is only acceptable for small, fixed lists (like 3-5 filter chips).

---

### Concept 09: Multi-Device State Sync

**Rule:** When the same user is logged in on multiple devices, a state change on one device must eventually reflect on the other.

**Flutter Implementation:**

```dart
// BLoC — periodic refresh for critical data
on<StartBookingPolling>((event, emit) async {
  await for (final _ in Stream.periodic(const Duration(seconds: 30))) {
    final bookings = await _repository.fetchBookings();
    emit(state.copyWith(bookings: bookings));
  }
});
```

**Laravel Implementation:**
- MVP chair availability comes from scheduled bookings only; do not add real-time chair-occupancy sockets or hardware tracking yet.
- Pull-to-refresh in Flutter for eventually-consistent data
- Optimistic updates with server confirmation for critical actions

---
