---
nodeid: docs.readiness.t08
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/packages/
---

# T8. Shared mobile layer

Status: done · Phase 5 · Depends on: T2, T4

- [x] T8.1 Endpoints and a feedback repository in `packages/core`.
- [x] T8.2 Reusable About/Legal and feedback widgets in `packages/design_system`.
- [x] T8.3 EN and AR ARB keys in `packages/localization`, added together.
- [x] T8.4 Approved by the owner (2026-11-18). Add `url_launcher` and `package_info_plus` (opens legal links and the web owner registration; sends `app_version`). Record both in `packages/core/CLAUDE.md` section 2 (third-party set).

Tests: repository and bloc-level tests; `melos verify`.
Acceptance: the shared pieces are usable by all three apps without app-specific code in packages.

## Implementation notes

- `package_info_plus` is `^10.0.0`: `^8` cannot resolve next to `flutter_secure_storage ^11` (both pull `win32` at incompatible majors). `url_launcher ^6.3.0`. Both are recorded in `packages/core/CLAUDE.md`, and `pub get` also refreshed the Linux plugin registrants of the three apps.
- The website lives on the API host, so `LegalLinks` derives its origin from `API_BASE_URL`; no new environment variable.
- Barber account deletion sits behind a separate `StaffAccountRepository` interface so existing fakes of `StaffAuthRepository` keep compiling; `StaffAuthRoutes.deleteAccount` is null for branches.
- Gates: `melos verify` (generate, build, analyze, taxonomy, tests for all apps and packages) passes; new tests: `core/test/feedback_repository_test.dart` (8), `design_system/test/feedback_form_test.dart` and `about_links_test.dart`.
