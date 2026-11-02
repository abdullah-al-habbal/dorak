---
nodeid: backend.13-technical-concepts.part-10
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 10 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-9.md) · [Next](13-technical-concepts-part-11.md)

```dart
// Repository — request specific fields for list screens
Future<List<Branch>> getBranches({String? fields}) async {
  final response = await _dio.get('/explore/branches', queryParameters: {
    if (fields != null) 'fields': fields,
  });
  // ...
}
```

---

## PART 2: FLUTTER FRONTEND PROBLEMS

### Concept 01: TextFormField with Controller vs without

**Rule:** A `TextFormField` can be **controlled** (with `TextEditingController`) or **uncontrolled** (with `initialValue` only). **Mixing both on one field causes assertion errors.**

| Aspect | With Controller (Controlled) | With initialValue (Uncontrolled) |
|--------|------------------------------|----------------------------------|
| **State Management** | Value lives in `TextEditingController` | Widget manages its own state |
| **Updates** | Controller updates on every keystroke | React reads only when form is submitted |
| **Pattern** | `TextFormField(controller: _nameController)` | `TextFormField(initialValue: 'default')` |
| **Use When** | You need to read/display the value live (e.g., character count, conditional UI) | Simple forms where you only need the value on submit |

**Critical Rule:** Pick one pattern per field and stick to it. Never pass both `controller` and `initialValue`.

```dart
// CORRECT — controlled
final _nameController = TextEditingController();
TextFormField(controller: _nameController)

// CORRECT — uncontrolled
TextFormField(initialValue: widget.user.name)

// WRONG — assertion error
TextFormField(controller: _nameController, initialValue: 'default')
```

---
