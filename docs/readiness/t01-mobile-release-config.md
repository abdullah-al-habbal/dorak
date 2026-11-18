---
nodeid: docs.readiness.t01
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/core/
---

# T1. Mobile release configuration

Status: done · Phase 1 · Depends on: none · Apps: client_app, business_app, stylist_app

Why: release Android builds have no `INTERNET` permission, are signed with the debug key, and carry placeholder names;
iOS lacks usage strings and a privacy manifest.

- [x] T1.1 Add `android.permission.INTERNET` to each main `android/app/src/main/AndroidManifest.xml`.
- [x] T1.2 Set real app labels (Android `android:label`, iOS `CFBundleDisplayName`).
- [x] T1.3 Release signing reads `key.properties`; fall back to debug only when it is absent; git-ignore the keystore files.
- [x] T1.4 iOS usage strings matched to the plugins each app uses (photos, camera, location). `client_app` has none today.
- [x] T1.5 Add `ios/Runner/PrivacyInfo.xcprivacy` to each app.
- [x] T1.6 Make `Firebase.initializeApp()` in `packages/core` fail-safe when config is missing; the app must still run.
- [x] T1.7 Confirm the bundled `.env` asset holds only base URLs; record it in the app docs.

Tests: push client with and without config; `melos verify`.
Acceptance: release build manifests include `INTERNET`; no secret in bundled assets; gates pass.

## Implementation notes

- Labels: `Dorak`, `Dorak Business`, `Dorak Stylist` (Android `android:label`, iOS `CFBundleDisplayName`). Placeholder names: confirm with the owner.
- Android also declares `POST_NOTIFICATIONS` (Android 13+ runtime request used by the push client).
- Signing: `android/key.properties` (git-ignored by the existing `android/.gitignore`) with `keyAlias`, `keyPassword`, `storeFile`, `storePassword`. Without it, release builds fall back to the debug key.
- iOS strings: `NSPhotoLibraryUsageDescription` for `client_app` and `stylist_app` (both pick from the gallery only; no camera string needed). `NSLocationWhenInUseUsageDescription` in all three because `core` links `geolocator`; only `client_app` calls it. Owner decision: keep it in `business_app` and `stylist_app`, or drop the plugin from those builds.
- `PrivacyInfo.xcprivacy` is registered in each `project.pbxproj` as a Resources entry. Declared data types (name, email, phone, user ID, device ID, photos; precise location for `client_app` only) are drawn from the code and are not a substitute for the store privacy forms. Validate in Xcode.
- Bug fixed on the way: the push client always registered `platform_type: android`; it now sends `ios` on iOS.
- `.env` bundled as an asset holds `API_BASE_URL`, `API_BASE_URL_V1` and the Reverb connection values, including `REVERB_APP_KEY`, a public client key by design. No credentials belong there.
- Still manual or not verifiable here: Xcode build and capabilities (Push Notifications entitlement, APNs key), the placeholder Google reversed client ID in `client_app` `Info.plist`, Firebase config files, and a real release build on Android and iOS (not run in this environment).
