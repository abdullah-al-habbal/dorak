---
nodeid: docs.readiness.t01
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/core/
---

# T1. Mobile release configuration

Status: todo · Phase 1 · Depends on: none · Apps: client_app, business_app, stylist_app

Why: release Android builds have no `INTERNET` permission, are signed with the debug key, and carry placeholder names;
iOS lacks usage strings and a privacy manifest.

- [ ] T1.1 Add `android.permission.INTERNET` to each main `android/app/src/main/AndroidManifest.xml`.
- [ ] T1.2 Set real app labels (Android `android:label`, iOS `CFBundleDisplayName`).
- [ ] T1.3 Release signing reads `key.properties`; fall back to debug only when it is absent; git-ignore the keystore files.
- [ ] T1.4 iOS usage strings matched to the plugins each app uses (photos, camera, location). `client_app` has none today.
- [ ] T1.5 Add `ios/Runner/PrivacyInfo.xcprivacy` to each app.
- [ ] T1.6 Make `Firebase.initializeApp()` in `packages/core` fail-safe when config is missing; the app must still run.
- [ ] T1.7 Confirm the bundled `.env` asset holds only base URLs; record it in the app docs.

Tests: push client with and without config; `melos verify`.
Acceptance: release build manifests include `INTERNET`; no secret in bundled assets; gates pass.
