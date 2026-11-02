---
nodeid: backend.13-technical-concepts.part-12
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 12 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-11.md) · [Next](13-technical-concepts-part-13.md)

### Concept 03: Handling Errors by Status Code

**Rule:** A generic "Something went wrong" toast for every failed request confuses users. Different status codes need **different UI responses**.

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| **401** | Not logged in | **Redirect** to login screen |
| **403** | Logged in, not allowed | Show "no permission" snackbar |
| **422** | Validation error | Show field-level errors in form |
| **429** | Too many requests | "Please wait" + retry timer |
| **500** | Server broke | Show retry button |

**Flutter Implementation:**

```dart
// ApiException carries status code
class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);
}

// BLoC error handler
on<SubmitForm>((event, emit) async {
  emit(state.copyWith(isLoading: true));
  try {
    await _repository.submit(event.data);
    emit(state.copyWith(isLoading: false, isSuccess: true));
  } on ApiException catch (e) {
    switch (e.statusCode) {
      case 401:
        emit(state.copyWith(redirectToLogin: true));
      case 422:
        emit(state.copyWith(validationErrors: e.errors));
      case 429:
        emit(state.copyWith(retryAfter: e.retryAfter));
      default:
        emit(state.copyWith(error: e.message));
    }
  }
});
```

---
