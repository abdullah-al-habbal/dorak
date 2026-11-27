---
codeanchors:
  - backend/modules/
---

Part 13 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-12.md) · [Next](13-technical-concepts-part-14.md)

### Concept 04: Local State vs Server State

**Rule:** Local state is UI-only — a modal being open, a form draft. Server state is data from the API that can go **stale**. Treating server data like local state means you rebuild caching/refetching manually.

| Local State (Widget/BLoC UI) | Server State (Repository/BLoC data) |
|------------------------------|-------------------------------------|
| Modal open/closed | User profile data |
| Form input draft | List of branches |
| Selected tab | Booking status |
| Loading indicator | Barber services list |

**Rule of Thumb in Flutter:**
- **Local state:** `setState`, `ValueNotifier`, or BLoC fields like `isModalOpen`
- **Server state:** BLoC loaded state + Repository with caching

```dart
// CORRECT — server state in BLoC, local state in widget
class BranchCard extends StatefulWidget {
  @override
  State<BranchCard> createState() => _BranchCardState();
}

class _BranchCardState extends State<BranchCard> {
  bool _isExpanded = false; // local state — UI only

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ExploreBloc, ExploreState>(
      builder: (context, state) {
        // state.branches — server state from BLoC
        return ExpansionTile(
          initiallyExpanded: _isExpanded, // local state
          children: state.branches.map(...).toList(),
        );
      },
    );
  }
}
```

---
