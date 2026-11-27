---
codeanchors:
  - backend/modules/
---

Part 14 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-13.md) · [Next](13-technical-concepts-part-15.md)

### Concept 05: Protected Routes & Auth Guards

**Rule:** Auth check must resolve **before** the real content renders. Never render protected content optimistically before the check completes.

**Flutter Implementation:**

```dart
// GoRouter with auth redirect
final router = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final authState = context.read<AuthBloc>().state;
    final isProtected = !['/login', '/register', '/splash'].contains(state.matchedLocation);

    if (authState is AuthInitial) {
      return '/splash'; // still checking — show splash
    }
    if (isProtected && authState is! AuthAuthenticated) {
      return '/login'; // not logged in — redirect
    }
    if (state.matchedLocation == '/login' && authState is AuthAuthenticated) {
      return '/explore'; // already logged in — redirect away
    }
    return null; // no redirect
  },
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    ShellRoute(
      builder: (_, __, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/explore', builder: (_, __) => const ExploreScreen()),
        GoRoute(path: '/bookings', builder: (_, __) => const BookingsScreen()),
        // ... protected routes
      ],
    ),
  ],
);
```

---
