---
nodeid: backend.13-technical-concepts.part-15
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 15 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-14.md) · [Next](13-technical-concepts-part-16.md)

### Concept 06: CORS from the Frontend Side

**Rule:** CORS is a browser security feature. **Flutter mobile apps are NOT affected** — CORS only applies to web browsers.

**In this repository:** the dashboard needs no CORS, because only its server calls the API. The Flutter apps aren't
affected, except Flutter web builds: there is no `modules/Core/Config/cors.php`, so Laravel's defaults apply (backlog
RR-12).

---

### Concept 07: Public vs Secret Env Variables

**Rule:** Secrets must never be bundled into the app binary or exposed to the client.

**Flutter Implementation:**

```bash
# Build-time secrets (baked into binary — use only for public config)
flutter run --dart-define=API_BASE_URL=https://api.dorak.com

# Runtime secrets (read from secure storage — for sensitive data)
# Use flutter_secure_storage for tokens, API keys on device
```

```dart
// CORRECT — secrets from secure storage
final token = await FlutterSecureStorage().read(key: 'auth_token');

// WRONG — hardcoded secrets
const apiKey = 'sk_live_abc123'; // NEVER do this
```

---
