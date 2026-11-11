---
nodeid: backend.13-technical-concepts.part-15
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 15 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-14.md) · [Next](13-technical-concepts-part-16.md)

### Concept 06: CORS from the Frontend Side

**Rule:** CORS is a browser security feature. **Flutter mobile apps are NOT affected** — CORS only applies to web browsers.

**Relevant For:**
- Next.js dashboard (browser calls go through its server-side proxy) → no CORS needed on the API
- Flutter mobile apps → No CORS concern

**Laravel Implementation (for web):**

```php
// config/cors.php — already handled by Laravel
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['https://admin.dorak.com'],
'supports_credentials' => true,
```

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
