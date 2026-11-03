---
nodeid: mobile.references.root.localization
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 11. Localization

- Source of truth: `packages/localization/l10n/app_en.arb` (template) +
  `app_ar.arb`. **200 keys, identical sets** (verified 2026-09-10).
- camelCase, feature-prefixed (`loginTitle`, `verifyResend`,
  `signUpPasswordHint`). Reuse existing keys before adding new ones.
- Generated output `lib/src/generated/` is committed and excluded from the
  analyzer and taxonomy checker.
- Five keys take ICU placeholders and generate functions, not getters:
  `verifySubtitle(String email)`, `verifyResendDisabled(int seconds)`,
  `curatedPriceRange(num min, num max, String currency)`,
  `serviceDurationLabel(int minutes)`, `servicePrice(String displayPrice, String currency)`.
- RTL is automatic from the locale. Use `Align` / `TextAlign.start` /
  `AlignmentDirectional`; never hardcode left/right. For directional icons
  follow the existing idiom:
  `isRtl ? Icons.arrow_forward : Icons.arrow_back`.

---

