---
nodeid: mobile.references.commands
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../CLAUDE.md`](../CLAUDE.md).

## 4. Development & Build Commands

When working with this monorepo via Melos or standard Flutter CLI:

```bash
# Bootstrap & link all monorepo packages
melos bootstrap

# Run code generation across all packages
melos run generate      # localization (gen-l10n) + build_runner (DTO/model codegen)
melos run build         # build_runner only (generate runs it too)

# Run static analysis enforcing dot-suffix naming and linting
melos run analyze

# Run unit and golden tests across packages
melos run test

# Full verification gate
melos run verify        # generate (incl. build_runner) → analyze → taxonomy → test
```
