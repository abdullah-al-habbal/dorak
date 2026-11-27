---
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [Strict Enums & JSON Serialization](../SKILL.md) · [Previous](../SKILL.md)

## 4. Comparisons

Compare model status against enum cases, never strings:

```php
// ❌ WRONG — strict comparison always fails
if ($chair->status !== 'available') { }

// ✅ CORRECT
if ($chair->status !== ChairStatus::Available) { }
```

## 5. Factories & Seeders

Use enum case references, not raw strings:

```php
'status' => ChairStatus::Available,
```

---

## 6–8. Flutter: `json_serializable`, `@JsonEnum`, zero manual parsing

Read [`references/flutter-json-serialization.md`](flutter-json-serialization.md) before writing or editing any Dart DTO/Entity or JSON-backed enum.
