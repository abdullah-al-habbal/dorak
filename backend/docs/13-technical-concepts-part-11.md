---
nodeid: backend.13-technical-concepts.part-11
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 11 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-10.md) · [Next](13-technical-concepts-part-12.md)

### Concept 02: Debouncing vs Throttling

**Rule:** Both limit how often a function runs — but differently. **Debounce** waits until the user stops triggering, then runs once. **Throttle** runs at most once per fixed interval.

| Aspect | Debounce | Throttle |
|--------|----------|----------|
| **Behavior** | Waits until user *stops* triggering → runs once | Runs *at most once* per fixed interval |
| **Use For** | Search-as-you-type (wait for pause) | Scroll/resize handlers (run steadily) |

**Flutter Implementation:**

```dart
// Debounce — search as you type
Timer? _debounce;

void _onSearchChanged(String query) {
  _debounce?.cancel();
  _debounce = Timer(const Duration(milliseconds: 300), () {
    context.read<SearchBloc>().add(SearchQueryChanged(query));
  });
}

@override
void dispose() {
  _debounce?.cancel();
  super.dispose();
}
```

```dart
// Throttle — scroll position updates
DateTime? _lastScrollUpdate;

void _onScroll(ScrollNotification notification) {
  final now = DateTime.now();
  if (_lastScrollUpdate != null && now.difference(_lastScrollUpdate!) < const Duration(milliseconds: 100)) {
    return; // throttle: skip if too soon
  }
  _lastScrollUpdate = now;
  // handle scroll...
}
```

---
