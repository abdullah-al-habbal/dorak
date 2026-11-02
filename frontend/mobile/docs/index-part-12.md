---
nodeid: mobile.docs.part-12
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 12 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index-part-11.md) · [Next](index-part-13.md)

# 7. Completion Rule

A Track is complete only when:

1. Required implementation exists.
2. Required documentation exists.
3. Required tests exist.
4. Required verification commands pass.
5. No known architectural violation remains.
6. The Track status is updated here.

The next Track MUST NOT begin until the current Track is complete.

---

# 8. Stitch Traceability Rule

For every Stitch-derived design:

```text
Stitch Screen
    ↓
docs/stitch/exports/<screen>/
    ↓
Normalized Markdown Specification
    ↓
Flutter Component / Screen
```

The raw Stitch export is evidence.

The Markdown specification is the implementation contract.

The Flutter code is the implementation.

Do not treat Stitch-generated HTML as production Flutter code.

---
