---
nodeid: mobile.packages.core.references.verification
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Verification

Referenced from [`../CLAUDE.md`](../CLAUDE.md) §6.

```bash
cd frontend/mobile
dart run melos run build      # after any DTO change
dart run melos run analyze
dart run melos run test
```

New public behaviour needs a test in `packages/core/test/`. Use the existing
helpers (`test/helpers/fake_dio.dart`, `test/helpers/fake_auth.dart`) rather
than adding a mocking package.
