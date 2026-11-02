---
nodeid: mobile.packages.localization.references.keys
parentnode: mobile.packages.localization
childnodes: []
codeanchors:
  - frontend/mobile/packages/localization/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 3. The 200 keys

**Common** — `splashTitle` `skip` `cancel` `next` `previous` `back` `homeTitle`

**Errors / validation** — `errorNetwork` `errorGeneric` `fieldRequired`
`fieldInvalidEmail` `fieldPasswordTooShort` `fieldPasswordMismatch`

**Global states (Track 12)** — `actionRetry` `errorTitleGeneric`
`errorTitleOffline` `emptyTitleGeneric` `emptyMessageGeneric`

**Locale toggle** — `localeArabic` `localeEnglish`

**Onboarding — welcome** — `onboardingWelcomeTitle` `onboardingWelcomeSubtitle`
`onboardingGetStarted`

**Onboarding — skip sheet** — `skipOnboardingQuestion` `skipForNow`
`dontShowAgain`

**Onboarding — discovery** — `discoveryTitle` `discoverySubtitle`
`discoveryCardShops` `discoveryCardBarbers` `discoveryCardServices`

**Onboarding — booking** — `bookingTitle` `bookingSubtitle` `bookingServiceLabel`
`bookingServiceMeta` `bookingProfessionalLabel` `bookingProfessionalRating`
`bookingDateLabel` `bookingTimeLabel`

**Onboarding — AI** — `aiTitle` `aiSubtitle` `aiMatchLabel` `aiRecommendedLabel`
`aiStyleFade` `aiStyleCrop` `aiFaceShapeLabel` `aiPrivacyNote`

**Auth entry (006)** — `authWelcomeTitle` `authSubtitle` `authLogIn`
`authCreateAccount` `authContinueAsGuest` `authGuestHint`

**Login (007)** — `loginTitle` `loginSubtitle` `loginEmailLabel`
`loginPasswordLabel` `loginForgotPassword` `loginButton` `loginSignUpPrompt`
`loginCreateAccountLink` `loginErrorInvalidCredentials`

**Sign-up (008)** — `signUpTitle` `signUpSubtitle` `signUpFullNameLabel`
`signUpEmailLabel` `signUpPasswordLabel` `signUpConfirmPasswordLabel`
`signUpPasswordHint` `signUpButton` `signUpAlreadyHaveAccount` `signUpLogInLink`

**Verify (009)** — `verifyTitle` `verifySubtitle` `verifyButton`
`verifyDidNotReceive` `verifyResend` `verifyResendDisabled` `verifyErrorInvalid`
`verifySkip`

**Discovery feed (016)** — `discoveryTitle` `discoverySubtitle`
`locationRequiredTitle` `locationRequiredMessage` `enableLocationAction`
`availableNow` `price` `rating` `distance` `viewDetails` `bookNow`
`discoverUniverseMen` `discoverUniverseWomen` `discoverRankedByDistance`
`discoverStaleLabel` `discoverTabLabel` `discoverDistanceLabel`
`discoverRankBadge` `discoverCompatibilityBadge`

**Change password (Track 17)** — `changePasswordTitle` `changePasswordSubtitle`
`changePasswordCurrentLabel` `changePasswordNewLabel`
`changePasswordConfirmLabel` `changePasswordSubmit`
`changePasswordSuccessTitle` `changePasswordSuccessMessage`
`changePasswordDone`

**My Bookings (017a)** — `bookingsTabLabel` `bookingFilterUpcoming`
`bookingFilterPast` `bookingStatusConfirmed` `bookingStatusCancelled`
`bookingStatusCompleted` `bookingWithBarber` `bookingChairLabel`
`bookingCancelAction` `bookingCancelConfirmTitle`
`bookingCancelConfirmMessage` `bookingCancelConfirm`

**Branch detail + booking creation (017b)** — `branchChairsCount`
`branchAvailableLabel` `branchOccupiedLabel` `branchMaintenanceLabel`
`branchBarbersTitle` `branchServicesTitle` `bookingSelectChair`
`bookingSelectServices` `bookingSelectTime` `bookingConfirmAction`
`bookingSuccessTitle` `bookingSuccessMessage` `bookingViewBookings`
`bookingConflictMessage`

**Service History + Rebook (018a)** — `historyTitle` `historyEmptyTitle`
`historyEmptyMessage` `historyRebookAction` `historyRebookTitle`
`historyRebookMessage` `historyRebookSuccessTitle`
`historyRebookSuccessMessage` `profileMemberLabel`

**Face Analysis + AI Style (018b)** — `profileAvatarFallbackInitial`
`profileUploadingAvatar` `faceAnalysisTitle` `faceAnalysisSubtitle`
`faceAnalysisScanAction` `faceAnalysisCheckAgainAction`
`faceAnalysisNoPhotoMessage` `faceAnalysisNoPhotoAction` `faceAnalysisPendingTitle`
`faceAnalysisPendingMessage` `faceAnalysisDetectedShapeLabel` `faceShapeOval`
`faceShapeRound` `faceShapeSquare` `faceShapeHeart` `faceShapeDiamond`
`faceShapeOblong` `faceShapeTriangle` `faceAnalysisUploadError`
`faceAnalysisResultsError` `curatedForYouTitle` `curatedForYouSubtitle`
`curatedPriceRange`

## 4. Parameterised keys

Ten, and they generate **methods**, not getters:

```dart
String verifySubtitle(String email);        // "…code we sent to {email}"
String verifyResendDisabled(int seconds);   // "Resend Code ({seconds}s)"
String discoverDistanceLabel(double km);    // "{km} km"
String discoverRankBadge(int rank);         // "#{rank}"
String discoverCompatibilityBadge(int percent); // "{percent}%"
String branchChairsCount(int count);        // "{count} chairs"
String historyRebookMessage(String item);   // "Rebook {item}?"
String curatedPriceRange(num min, num max, String currency); // "{min}–{max} {currency}"
String serviceDurationLabel(int minutes);   // "{minutes} min"
String servicePrice(String displayPrice, String currency); // "{displayPrice} {currency}"
```

ARB form:

```json
"verifyResendDisabled": "Resend Code ({seconds}s)",
"@verifyResendDisabled": {
  "description": "Verify account resend action during cooldown",
  "placeholders": { "seconds": { "type": "int" } }
}
```

Everything else is a plain getter. There are no plurals or `select` messages
yet — adding one is fine, but declare the placeholder type.
