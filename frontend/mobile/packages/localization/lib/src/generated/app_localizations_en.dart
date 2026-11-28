// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get splashTitle => 'Dorak';

  @override
  String get skip => 'Skip';

  @override
  String get onboardingWelcomeTitle => 'Your grooming experience, reimagined.';

  @override
  String get onboardingWelcomeSubtitle =>
      'Discover top-tier professionals, book with ease, and personalize your style journey.';

  @override
  String get onboardingGetStarted => 'Get Started';

  @override
  String get skipOnboardingQuestion => 'Skip Onboarding?';

  @override
  String get skipForNow => 'Skip for now';

  @override
  String get dontShowAgain => 'Don\'t show again';

  @override
  String get cancel => 'Cancel';

  @override
  String get discoveryTitle => 'Find the perfect fit.';

  @override
  String get discoverySubtitle =>
      'Explore nearby shops, expert barbers, and premium services tailored to your needs.';

  @override
  String get next => 'Next';

  @override
  String get discoveryCardShops => 'Shops';

  @override
  String get discoveryCardBarbers => 'Barbers';

  @override
  String get discoveryCardServices => 'Services';

  @override
  String get previous => 'Back';

  @override
  String get localeArabic => 'العربية';

  @override
  String get localeEnglish => 'English';

  @override
  String get bookingTitle => 'Book when it works for you.';

  @override
  String get bookingSubtitle =>
      'Choose your service, professional, and time — then book in just a few taps.';

  @override
  String get bookingServiceLabel => 'Premium Fade';

  @override
  String get bookingServiceMeta => '45 min • \$65';

  @override
  String get bookingProfessionalLabel => 'Marcus T.';

  @override
  String get bookingProfessionalRating => '4.9';

  @override
  String get bookingDateLabel => 'Tomorrow';

  @override
  String get bookingTimeLabel => '2:30 PM';

  @override
  String get aiTitle => 'Discover styles made for you.';

  @override
  String get aiSubtitle =>
      'Get personalized style recommendations based on your preferences and, if you choose, your face profile.';

  @override
  String get aiMatchLabel => '98% Match';

  @override
  String get aiRecommendedLabel => 'Recommended';

  @override
  String get aiStyleFade => 'Premium Fade';

  @override
  String get aiStyleCrop => 'Textured Crop';

  @override
  String get aiFaceShapeLabel => 'Face Shape: Oval';

  @override
  String get aiPrivacyNote => 'Face analysis is entirely optional.';

  @override
  String get authWelcomeTitle => 'Welcome to Dorak';

  @override
  String get authSubtitle =>
      'Sign in to access your personalized experience, or continue as a guest to explore.';

  @override
  String get authLogIn => 'Log In';

  @override
  String get authCreateAccount => 'Create Account';

  @override
  String get authContinueAsGuest => 'Continue as Guest';

  @override
  String get authGuestHint => 'Explore Dorak without creating an account.';

  @override
  String get back => 'Back';

  @override
  String get loginTitle => 'Welcome Back';

  @override
  String get loginSubtitle => 'Sign in to your account';

  @override
  String get loginEmailLabel => 'Email';

  @override
  String get loginPasswordLabel => 'Password';

  @override
  String get loginForgotPassword => 'Forgot Password?';

  @override
  String get loginButton => 'Log In';

  @override
  String get loginSignUpPrompt => 'Don\'t have an account?';

  @override
  String get loginCreateAccountLink => 'Create Account';

  @override
  String get loginErrorInvalidCredentials => 'Invalid email or password';

  @override
  String get authAccountSuspended =>
      'This account is suspended. Contact support for help.';

  @override
  String get authAccountNotActive =>
      'This account is not active. Complete verification or contact support.';

  @override
  String get signUpTitle => 'Create your account';

  @override
  String get signUpSubtitle =>
      'Join Dorak for personalized grooming and effortless booking.';

  @override
  String get signUpFullNameLabel => 'Full Name';

  @override
  String get signUpEmailLabel => 'Email';

  @override
  String get signUpPasswordLabel => 'Password';

  @override
  String get signUpConfirmPasswordLabel => 'Confirm Password';

  @override
  String get signUpPasswordHint => 'At least 8 characters';

  @override
  String get signUpButton => 'Create Account';

  @override
  String get signUpAlreadyHaveAccount => 'Already have an account?';

  @override
  String get signUpLogInLink => 'Log In';

  @override
  String get verifyTitle => 'Verify Your Account';

  @override
  String verifySubtitle(String email) {
    return 'Enter the 6-digit code we sent to $email';
  }

  @override
  String get verifyButton => 'Verify & Continue';

  @override
  String get verifyDidNotReceive => 'Didn\'t receive the code?';

  @override
  String get verifyResend => 'Resend Code';

  @override
  String verifyResendDisabled(int seconds) {
    return 'Resend Code (${seconds}s)';
  }

  @override
  String get verifyErrorInvalid => 'Invalid code. Please try again.';

  @override
  String get verifySkip => 'Verify later';

  @override
  String get fieldRequired => 'This field is required';

  @override
  String get fieldInvalid => 'Please check this field';

  @override
  String get fieldInvalidEmail => 'Please enter a valid email address';

  @override
  String get fieldPasswordTooShort => 'Password must be at least 8 characters';

  @override
  String get fieldPasswordMismatch => 'Passwords do not match';

  @override
  String get errorNetwork => 'No connection. Check your network and try again.';

  @override
  String get errorGeneric => 'Something went wrong. Please try again.';

  @override
  String get actionRetry => 'Try again';

  @override
  String get errorTitleGeneric => 'Something went wrong';

  @override
  String get emptyTitleGeneric => 'Nothing here yet';

  @override
  String get emptyMessageGeneric => 'There\'s nothing to show right now.';

  @override
  String get recoveryEmailTitle => 'Forgot Password?';

  @override
  String get recoveryEmailSubtitle =>
      'Enter the email on your account and we\'ll send you a 6-digit reset code.';

  @override
  String get recoveryEmailLabel => 'Email';

  @override
  String get recoverySendCodeButton => 'Send Code';

  @override
  String get recoveryReturnToLogIn => 'Return to Log In';

  @override
  String get recoveryOtpTitle => 'Enter Reset Code';

  @override
  String recoveryOtpSubtitle(String email) {
    return 'If $email is registered, we\'ve sent it a 6-digit code. It expires in 10 minutes.';
  }

  @override
  String get recoveryOtpContinueButton => 'Continue';

  @override
  String get recoveryOtpIncomplete => 'Enter all 6 digits';

  @override
  String get recoveryResend => 'Resend Code';

  @override
  String recoveryResendDisabled(int seconds) {
    return 'Resend Code (${seconds}s)';
  }

  @override
  String get recoveryDidNotReceive => 'Didn\'t receive the code?';

  @override
  String get recoveryNewPasswordTitle => 'Create New Password';

  @override
  String get recoveryNewPasswordSubtitle =>
      'Choose a new password for your account.';

  @override
  String get recoveryNewPasswordLabel => 'New Password';

  @override
  String get recoveryConfirmPasswordLabel => 'Confirm New Password';

  @override
  String get recoveryResetButton => 'Reset Password';

  @override
  String get recoveryCodeRejected => 'That code is invalid or has expired.';

  @override
  String get recoveryCodeThrottled =>
      'Too many attempts. Please wait a minute and try again.';

  @override
  String get recoveryReenterCode => 'Re-enter code';

  @override
  String get passwordResetSuccessTitle => 'Password Updated';

  @override
  String get passwordResetSuccessMessage =>
      'Your password has been changed. You can now log in with your new password.';

  @override
  String get onboardingConfigUnavailable =>
      'Couldn\'t load the latest artwork.';

  @override
  String get bookingsTitle => 'No bookings yet';

  @override
  String get bookingsSubtitle =>
      'Your upcoming and past bookings will appear here.';

  @override
  String get favoritesTitle => 'No favorites yet';

  @override
  String get favoritesSubtitle =>
      'Tap the heart on a salon or barber to save it here.';

  @override
  String get favoritesActionLabel => 'Discover';

  @override
  String get profileActionLabel => 'Discover';

  @override
  String get locationRequiredTitle => 'Location Required';

  @override
  String get locationRequiredMessage =>
      'Enable location access to discover nearby branches.';

  @override
  String get enableLocationAction => 'Enable Location';

  @override
  String get availableNow => 'Available Now';

  @override
  String get price => 'Price';

  @override
  String get rating => 'Rating';

  @override
  String get distance => 'Distance';

  @override
  String get viewDetails => 'View Details';

  @override
  String get bookNow => 'Book Now';

  @override
  String get discoverUniverseMen => 'Men';

  @override
  String get discoverUniverseWomen => 'Women';

  @override
  String get discoverRankedByDistance => 'Ranked by distance';

  @override
  String get discoverFreelancerBadge => 'Freelancer';

  @override
  String get discoverTravelsToYou => 'Travels to you';

  @override
  String get discoverSearchHint => 'Search shops, brands or services';

  @override
  String ratingSummary(String rating, int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count reviews',
      one: '1 review',
    );
    return '★ $rating ($_temp0)';
  }

  @override
  String get ratingNoReviews => 'No reviews yet';

  @override
  String discoverDistanceLabel(double km) {
    return '$km km';
  }

  @override
  String get discoverStaleLabel => 'Showing saved results';

  @override
  String discoverRankBadge(int rank) {
    return '#$rank';
  }

  @override
  String get discoverTabLabel => 'Discover';

  @override
  String get changePasswordTitle => 'Change Password';

  @override
  String get changePasswordSubtitle =>
      'Enter your current password, then choose a new one.';

  @override
  String get changePasswordCurrentLabel => 'Current Password';

  @override
  String get profileEmailPasswordHint => 'Required to change your email.';

  @override
  String get changePasswordNewLabel => 'New Password';

  @override
  String get changePasswordConfirmLabel => 'Confirm New Password';

  @override
  String get changePasswordSubmit => 'Update Password';

  @override
  String get changePasswordSuccessMessage => 'Your password has been changed.';

  @override
  String get changePasswordDone => 'Done';

  @override
  String get bookingsTabLabel => 'Bookings';

  @override
  String get bookingFilterUpcoming => 'Upcoming';

  @override
  String get bookingFilterPast => 'Past';

  @override
  String get bookingStatusConfirmed => 'Confirmed';

  @override
  String get bookingStatusCancelled => 'Cancelled';

  @override
  String get bookingStatusCompleted => 'Completed';

  @override
  String bookingWithBarber(String name) {
    return 'with $name';
  }

  @override
  String bookingChairLabel(String label) {
    return 'Chair $label';
  }

  @override
  String get bookingCancelAction => 'Cancel Booking';

  @override
  String get bookingCancelConfirmTitle => 'Cancel this booking?';

  @override
  String get bookingCancelConfirmMessage =>
      'Your slot will be freed. You can book again anytime.';

  @override
  String get bookingCancelConfirm => 'Yes, Cancel';

  @override
  String branchChairBarberServices(String name) {
    return 'Services by $name';
  }

  @override
  String get branchChairShopMenu => 'Shop menu';

  @override
  String get branchChairNoServices =>
      'No services are listed for this chair yet.';

  @override
  String get stylistWorkplacesTitle => 'Works at';

  @override
  String stylistWorkplaceChair(String place, String chair) {
    return '$place · $chair';
  }

  @override
  String branchChairsCount(int count) {
    return '$count chairs';
  }

  @override
  String get branchNotBookableTitle => 'Booking is not available yet';

  @override
  String get branchNotBookableMessage =>
      'This branch has not set up its services or team yet. Check back soon.';

  @override
  String get branchAvailableLabel => 'Available';

  @override
  String get branchOccupiedLabel => 'Occupied';

  @override
  String get branchBarbersTitle => 'Barbers';

  @override
  String get bookingSelectServices => 'Select services';

  @override
  String get bookingSelectTime => 'Select time';

  @override
  String get bookingSelectDate => 'Select date';

  @override
  String get bookingNoSlots => 'No available slots';

  @override
  String get bookingSelectServiceHint => 'Select a service to continue';

  @override
  String get bookingConfirmAction => 'Confirm Booking';

  @override
  String get bookingSuccessTitle => 'Booking Confirmed';

  @override
  String get bookingSuccessMessage => 'Your slot is reserved.';

  @override
  String get bookingViewBookings => 'View My Bookings';

  @override
  String get bookingConflictMessage =>
      'That slot was just taken. Please pick another time.';

  @override
  String get bookingOutsideScheduleMessage =>
      'The requested time is outside the barber schedule.';

  @override
  String get bookingAtHomeBarberRequiredMessage =>
      'An at-home booking requires a barber.';

  @override
  String get bookingAtHomeServiceNotEligibleMessage =>
      'Every service must be an at-home service offered by the selected barber.';

  @override
  String get bookingAtHomeNotOfferedMessage =>
      'This barber does not offer at-home service.';

  @override
  String get bookingAtHomeOutOfRadiusMessage =>
      'Your location is outside the barber\'s travel radius.';

  @override
  String discoverCompatibilityBadge(int percent) {
    return '$percent%';
  }

  @override
  String get historyTitle => 'Service History';

  @override
  String get historyEmptyTitle => 'No history yet';

  @override
  String get historyEmptyMessage =>
      'Services you\'ve booked will appear here after their appointment.';

  @override
  String get historyRebookAction => 'Book Again';

  @override
  String get historyRebookSuccessTitle => 'Booked Again';

  @override
  String get historyRebookSuccessMessage =>
      'Your new slot is reserved. Find it in Bookings.';

  @override
  String get profileMemberLabel => 'Member';

  @override
  String get faceAnalysisTitle => 'Face Analysis';

  @override
  String get faceAnalysisDetectedShape => 'Detected Shape';

  @override
  String get faceAnalysisConfidence => 'Confidence';

  @override
  String get faceScanAction => 'Scan my face';

  @override
  String get faceAnalysisPendingTitle => 'Analysis in progress';

  @override
  String get faceAnalysisPendingMessage =>
      'We are analyzing your face. Check again in a moment.';

  @override
  String get faceAnalysisEmptyTitle => 'No analysis yet';

  @override
  String get faceAnalysisEmptyMessage =>
      'Upload a photo to discover the styles that suit you.';

  @override
  String get actionCheckAgain => 'Check again';

  @override
  String get faceShapeOval => 'Oval';

  @override
  String get faceShapeRound => 'Round';

  @override
  String get faceShapeSquare => 'Square';

  @override
  String get faceShapeHeart => 'Heart';

  @override
  String get faceShapeDiamond => 'Diamond';

  @override
  String get faceShapeOblong => 'Oblong';

  @override
  String get faceShapeTriangle => 'Triangle';

  @override
  String get curatedForYouTitle => 'Curated For You';

  @override
  String get curatedEmptyMessage => 'No matching styles yet.';

  @override
  String curatedPriceRange(num min, num max, String currency) {
    return '$min–$max $currency';
  }

  @override
  String get stylistServicesTitle => 'Services';

  @override
  String get stylistBookAction => 'Book';

  @override
  String get stylistBookUnavailableHint =>
      'Booking is available for stylists who work at a shop';

  @override
  String get deleteAccountTitle => 'Delete account';

  @override
  String get deleteAccountWarning =>
      'Deleting your account is permanent. Enter your password to confirm.';

  @override
  String get deleteAccountPassword => 'Password';

  @override
  String get deleteAccountConfirm => 'Delete my account';

  @override
  String get deleteAccountWrongPassword => 'The password is incorrect.';

  @override
  String get deleteAccountActiveBookings =>
      'Cancel or finish your upcoming bookings before deleting your account.';

  @override
  String get historyAttachPhotoAction => 'Add photo';

  @override
  String get historyMediaTypeTitle => 'What kind of photo is this?';

  @override
  String get historyMediaTypeBefore => 'Before';

  @override
  String get historyMediaTypeAfter => 'After';

  @override
  String get historyMediaTypeReference => 'Reference';

  @override
  String get historyMediaTypeContinue => 'Continue';

  @override
  String get historyAttachPhotoFailed =>
      'The photo could not be added. Try again.';

  @override
  String get branchReviewsTitle => 'Reviews';

  @override
  String get branchReviewsEmptyTitle => 'No reviews yet';

  @override
  String get branchReviewsEmptyMessage =>
      'Reviews from clients will appear here.';

  @override
  String get branchReviewsLoadMore => 'Load more';

  @override
  String get savedFiltersTitle => 'Saved filters';

  @override
  String get savedFiltersEmpty => 'No saved filters yet.';

  @override
  String get savedFiltersDelete => 'Delete filter';

  @override
  String get savedFiltersNameLabel => 'Filter name';

  @override
  String get savedFiltersSaveCurrent => 'Save current filters';

  @override
  String get discoveryPreferencesTitle => 'Discovery preferences';

  @override
  String get discoveryPreferencesShowUnavailable => 'Show unavailable results';

  @override
  String get discoveryPreferencesClearHidden => 'Show hidden brands again';

  @override
  String discoveryPreferencesRadius(int km) {
    return 'Default search radius: $km km';
  }

  @override
  String discoveryPreferencesHiddenBrands(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count hidden brands',
      one: '1 hidden brand',
    );
    return '$_temp0';
  }

  @override
  String get discoveryPreferencesChooseBrands => 'Choose brands to hide';

  @override
  String get brandVisibilityTitle => 'Hide brands from discovery';

  @override
  String get brandVisibilityEmpty => 'No brands available.';

  @override
  String get stylistNoServicesMessage => 'No services listed yet.';

  @override
  String get serviceAtHomeLabel => 'At-Home Available';

  @override
  String serviceDurationLabel(int minutes) {
    return '$minutes min';
  }

  @override
  String servicePrice(String displayPrice, String currency) {
    return '$displayPrice $currency';
  }

  @override
  String get stylistStatServicesLabel => 'Services';

  @override
  String get stylistStatRankLabel => 'Rank';

  @override
  String get stylistStatCompatibilityLabel => 'Compatibility';

  @override
  String get reviewTitle => 'Rate Your Experience';

  @override
  String get reviewStylistPrompt => 'How was your session?';

  @override
  String get reviewSubmitButton => 'Submit Review';

  @override
  String get reviewSubmitSuccess => 'Review submitted';

  @override
  String get reviewAlreadyReviewed => 'You already reviewed this booking';

  @override
  String get reviewBookingNotCompleted =>
      'This booking hasn\'t been completed yet';

  @override
  String get reviewErrorGeneric => 'Could not submit your review';

  @override
  String get bookingRateAction => 'Rate';

  @override
  String get profileCompletionTitle => 'Complete Your Profile';

  @override
  String get profileCompletionSubtitle =>
      'Add your details to personalize your Dorak experience.';

  @override
  String get profileCompletionNameLabel => 'Name';

  @override
  String get profileCompletionPhoneLabel => 'Phone number';

  @override
  String get profileCompletionContinue => 'Save & Continue';

  @override
  String get profileCompletionError => 'Could not save your profile';

  @override
  String get bookingAtHomeToggle => 'Book at home';

  @override
  String get bookingAtHomeStreetLabel => 'Street';

  @override
  String get bookingAtHomeBuildingLabel => 'Building';

  @override
  String get bookingAtHomeUnitLabel => 'Unit / apartment';

  @override
  String get bookingAtHomePinAction => 'Use current location as GPS pin';

  @override
  String bookingAtHomePinSelected(String latitude, String longitude) {
    return 'GPS pin selected: $latitude, $longitude';
  }

  @override
  String get bookingAtHomeLocationError =>
      'We couldn\'t get your GPS location. Check location permission and try again.';

  @override
  String bookingEndTimeLabel(String time) {
    return 'Ends $time';
  }

  @override
  String get bookingCancellationClosed =>
      'Cancellation is unavailable within two hours of the appointment.';

  @override
  String get reviewStatusPublished => 'Published';

  @override
  String get reviewStatusUnderReview => 'Under review';

  @override
  String get reviewStatusHidden => 'Hidden';

  @override
  String get reviewStatusResolved => 'Resolved';

  @override
  String get reviewDisputeHoldNote =>
      'This review is held for up to 48 hours while an administrator resolves the dispute.';

  @override
  String get floorZoneMen => 'Men\'s zone';

  @override
  String get floorZoneWomen => 'Women\'s zone';

  @override
  String get floorZoneShared => 'Shared zone';

  @override
  String get managerManualBarberTitle => 'Add barber';

  @override
  String get managerManualBarberSubtitle =>
      'Create a barber profile without creating a login account.';

  @override
  String get managerBarberNameEnglish => 'Name in English';

  @override
  String get managerBarberNameArabic => 'Name in Arabic';

  @override
  String get managerBarberPhone => 'Phone number';

  @override
  String get managerBarberPhoneHint =>
      'Include country code, for example +963...';

  @override
  String get managerBarberPhoneSharedNote =>
      'A client may use this same number. It creates a separate barber profile.';

  @override
  String get managerBarberCreate => 'Create barber';

  @override
  String get managerBarberPhoneInvalid =>
      'Enter a valid phone number with country code.';

  @override
  String get managerBarberCreated => 'Barber created without a login account.';

  @override
  String get managerBarberCreateError =>
      'Could not create the barber. Please try again.';

  @override
  String get bookingFirstAvailable => 'First available';

  @override
  String get bookingPreferredBarber => 'Preferred barber';

  @override
  String get bookingSummaryTitle => 'Booking summary';

  @override
  String bookingTotalPrice(Object price) {
    return 'Total price: $price';
  }

  @override
  String bookingTotalDuration(int minutes) {
    return 'Estimated duration: $minutes min';
  }

  @override
  String get bookingPaymentTitle => 'Payment';

  @override
  String get bookingPayAtSalon => 'Pay at salon';

  @override
  String get bookingPayAtSalonOnly =>
      'Payment is due in person when you arrive at the salon.';

  @override
  String get bookingStatusInProgress => 'In progress';

  @override
  String get bookingTrackerTitle => 'Appointment status';

  @override
  String get bookingTrackerConfirmed => 'Your appointment is confirmed.';

  @override
  String get bookingTrackerInProgress => 'Your appointment is in progress.';

  @override
  String get bookingTrackerCompleted => 'Your appointment is completed.';

  @override
  String get bookingTrackerPending =>
      'Your appointment is awaiting confirmation.';

  @override
  String get bookingTrackerNoShow =>
      'This appointment was marked as a no-show.';

  @override
  String get bookingTrackerCancelled => 'This appointment was cancelled.';

  @override
  String get bookingTrackAction => 'Track appointment';

  @override
  String get profileEditAction => 'Edit profile';

  @override
  String get profileEditTitle => 'Edit profile';

  @override
  String get profileSaveAction => 'Save';

  @override
  String get profileFullNameLabel => 'Full name';

  @override
  String get profilePhoneNumberLabel => 'Phone number';

  @override
  String get profileEmailLabel => 'Email';

  @override
  String get profileSettingsAction => 'Settings';

  @override
  String get profileSettingsTitle => 'Settings';

  @override
  String get profileSettingsLanguageLabel => 'Preferred language';

  @override
  String get profileSettingsLanguageEnglish => 'English';

  @override
  String get profileSettingsLanguageArabic => 'Arabic';

  @override
  String get profileSettingsCurrencyLabel => 'Display currency';

  @override
  String get profileSettingsPriceDisplayModeLabel => 'Price display';

  @override
  String get profileSettingsPriceDisplayModeTaxInclusive => 'Tax inclusive';

  @override
  String get profileSettingsPriceDisplayModeTaxExclusive => 'Tax exclusive';

  @override
  String get profileSettingsSaved => 'Settings saved';

  @override
  String get savedAddressesTitle => 'Saved addresses';

  @override
  String get savedAddressAddTitle => 'Add address';

  @override
  String get savedAddressEditTitle => 'Edit address';

  @override
  String get savedAddressStreetLabel => 'Street';

  @override
  String get savedAddressBuildingLabel => 'Building';

  @override
  String get savedAddressUnitLabel => 'Unit';

  @override
  String get savedAddressLatitudeLabel => 'Latitude';

  @override
  String get savedAddressLongitudeLabel => 'Longitude';

  @override
  String get businessBranchOperationsTitle => 'Branch operations';

  @override
  String businessAppointmentDateTime(String date, String time) {
    return '$date · $time';
  }

  @override
  String get bookingStatusPending => 'Pending';

  @override
  String get bookingStatusNoShow => 'No-show';

  @override
  String get bookingStatusUnknown => 'Unknown status';

  @override
  String get staffLogOut => 'Log out';

  @override
  String get businessLoginTitle => 'Sign in to your branch';

  @override
  String get businessLoginSubtitle =>
      'Use your branch account to manage operations.';

  @override
  String get stylistLoginTitle => 'Sign in to your stylist account';

  @override
  String get stylistLoginSubtitle =>
      'Manage your appointments and work status.';

  @override
  String get stylistSignUpLink => 'New to Dorak? Create a stylist account';

  @override
  String get stylistSignUpTitle => 'Join Dorak as a stylist';

  @override
  String get stylistSignUpSubtitle =>
      'Create your account. An administrator reviews new stylists before they can take bookings.';

  @override
  String get stylistSignUpFreelancerLabel =>
      'I work independently (freelancer)';

  @override
  String get stylistSignUpEmailTaken =>
      'An account with this email already exists.';

  @override
  String get stylistVerifyCodeLabel => 'Verification code';

  @override
  String get stylistVerifyCodeResent => 'A new code was sent.';

  @override
  String get stylistPendingTitle => 'Awaiting approval';

  @override
  String get stylistPendingMessage =>
      'Your account was created. An administrator will review and activate it; you can sign in once it is approved.';

  @override
  String get stylistPendingBackToLogin => 'Back to sign in';

  @override
  String get chairStatusAvailable => 'Available';

  @override
  String get chairStatusOccupied => 'Occupied';

  @override
  String get chairStatusMaintenance => 'Under maintenance';

  @override
  String get chairStatusUnknown => 'Unknown status';

  @override
  String get chairMaintenanceConflictTitle => 'Chair has upcoming bookings';

  @override
  String chairMaintenanceConflictBody(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other:
          '$count upcoming bookings use this chair. Setting maintenance will cancel them and notify each client.',
      one:
          '1 upcoming booking uses this chair. Setting maintenance will cancel it and notify the client.',
    );
    return '$_temp0';
  }

  @override
  String chairMaintenanceConflictConfirm(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'Set maintenance and cancel $count bookings',
      one: 'Set maintenance and cancel 1 booking',
    );
    return '$_temp0';
  }

  @override
  String get chairMaintenanceConflictKeep => 'Keep chair available';

  @override
  String get businessRetry => 'Retry';

  @override
  String get businessDashboardTitle => 'Dashboard';

  @override
  String businessTodayRevenue(Object value) {
    return 'Today revenue: $value';
  }

  @override
  String businessMonthlyRevenue(Object value) {
    return 'Monthly revenue: $value';
  }

  @override
  String businessTodayBookings(int value) {
    return 'Today bookings: $value';
  }

  @override
  String businessActiveChairs(int active, int total) {
    return 'Active chairs: $active/$total';
  }

  @override
  String businessChairStatus(Object value) {
    return 'Chair status: $value';
  }

  @override
  String get businessBranchHint => 'Branch';

  @override
  String get businessAppointmentsTitle => 'Appointments';

  @override
  String get businessConfirm => 'Confirm';

  @override
  String get businessStart => 'Start';

  @override
  String get businessComplete => 'Complete';

  @override
  String get businessNoShow => 'No-show';

  @override
  String get businessCancelBooking => 'Cancel';

  @override
  String get businessChairsTitle => 'Chairs';

  @override
  String get businessUnassigned => 'Unassigned';

  @override
  String get stylistTodayTitle => 'Today';

  @override
  String stylistAppointmentDateTime(String date, String time) {
    return '$date · $time';
  }

  @override
  String get stylistWorkstationOnline => 'Workstation online';

  @override
  String get stylistUpdateFailed => 'Could not update. Pull to retry.';

  @override
  String get stylistTodayAppointments => 'Today\'s appointments';

  @override
  String get stylistAcceptBooking => 'Accept Booking';

  @override
  String get stylistStartSession => 'Start Session';

  @override
  String get stylistCompleteSession => 'Complete Session';

  @override
  String get stylistMarkNoShow => 'Mark No-Show';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get notificationsEmptyTitle => 'No notifications yet';

  @override
  String get notificationsEmptyMessage =>
      'Booking updates, invitations and review requests will appear here.';

  @override
  String get notificationsMarkAllRead => 'Mark all as read';

  @override
  String get notificationsUnreadLabel => 'Unread';

  @override
  String get profileNotificationsAction => 'Notifications';

  @override
  String get phoneVerifyTitle => 'Verify your phone';

  @override
  String phoneVerifySubtitle(String phone) {
    return 'Enter the 6-digit code we sent to $phone';
  }

  @override
  String get phoneVerifyCodeLabel => 'Verification code';

  @override
  String get phoneVerifyButton => 'Verify phone';

  @override
  String get phoneVerifyResend => 'Resend code';

  @override
  String get phoneVerifySkip => 'Not now';

  @override
  String get phoneVerifyIncomplete => 'Enter the 6-digit code.';

  @override
  String get phoneVerifyInvalidCode => 'That code is invalid or has expired.';

  @override
  String get phoneVerifyPhoneRejected =>
      'This phone number can\'t be verified. Check it or use another number.';

  @override
  String get phoneVerifyThrottled =>
      'Too many attempts. Please wait a minute and try again.';

  @override
  String get profilePhoneVerifiedLabel => 'Verified';

  @override
  String get profilePhoneChangeHint =>
      'Changing your phone sends a verification code';

  @override
  String branchTodayHours(String opens, String closes) {
    return 'Today $opens–$closes';
  }

  @override
  String get branchClosedToday => 'Closed today';

  @override
  String get branchAddressLabel => 'Address';

  @override
  String get stylistMenuSchedule => 'Schedule';

  @override
  String get stylistMenuPortfolio => 'Portfolio';

  @override
  String get stylistMenuProfile => 'Profile';

  @override
  String get stylistMenuAffiliations => 'Affiliations';

  @override
  String get stylistMenuJobs => 'Jobs';

  @override
  String get stylistCancelBooking => 'Cancel booking';

  @override
  String get stylistCancelReasonTitle => 'Why are you cancelling?';

  @override
  String get stylistCancelReasonLabel => 'Reason';

  @override
  String get stylistCancelReasonRequired => 'Enter a reason';

  @override
  String get stylistCancelKeep => 'Keep booking';

  @override
  String get stylistSave => 'Save';

  @override
  String get commonSaved => 'Saved';

  @override
  String get commonLoadFailed => 'Could not load. Pull to retry.';

  @override
  String get stylistScheduleTitle => 'Weekly hours';

  @override
  String get stylistScheduleStart => 'Start';

  @override
  String get stylistScheduleEnd => 'End';

  @override
  String get stylistScheduleInvalidRange => 'End time must be after start time';

  @override
  String get stylistScheduleEmpty => 'Turn on at least one working day';

  @override
  String get stylistWeekday0 => 'Sunday';

  @override
  String get stylistWeekday1 => 'Monday';

  @override
  String get stylistWeekday2 => 'Tuesday';

  @override
  String get stylistWeekday3 => 'Wednesday';

  @override
  String get stylistWeekday4 => 'Thursday';

  @override
  String get stylistWeekday5 => 'Friday';

  @override
  String get stylistWeekday6 => 'Saturday';

  @override
  String get stylistPortfolioTitle => 'Portfolio';

  @override
  String get stylistPortfolioEmpty => 'No photos yet. Add your best work.';

  @override
  String get stylistPortfolioAdd => 'Add photo';

  @override
  String get stylistPortfolioDelete => 'Delete photo';

  @override
  String get stylistProfileTitle => 'Profile';

  @override
  String get stylistProfileBioEnglish => 'Bio (English)';

  @override
  String get stylistProfileBioArabic => 'Bio (Arabic)';

  @override
  String get stylistTravelRadiusLabel => 'Travel radius';

  @override
  String stylistTravelRadiusValue(String kilometers) {
    return '$kilometers km';
  }

  @override
  String get stylistAffiliationsTitle => 'Affiliations';

  @override
  String get stylistAffiliationsEmpty => 'No affiliations yet.';

  @override
  String get stylistAffiliationAccept => 'Accept';

  @override
  String get stylistAffiliationReject => 'Reject';

  @override
  String get stylistAffiliationStatusPending => 'Pending';

  @override
  String get stylistAffiliationStatusActive => 'Active';

  @override
  String get stylistAffiliationStatusRejected => 'Rejected';

  @override
  String get stylistAffiliationStatusTerminated => 'Terminated';

  @override
  String get affiliationStatusUnknown => 'Unknown status';

  @override
  String get stylistJobsTitle => 'Jobs';

  @override
  String get stylistJobsEmpty => 'No open jobs right now.';

  @override
  String get stylistJobApply => 'Apply';

  @override
  String get stylistJobApplied => 'Application sent';

  @override
  String get stylistJobApplyRejected =>
      'This job is closed or you already applied.';

  @override
  String get stylistMyApplications => 'My applications';

  @override
  String get stylistApplicationsEmpty => 'You have not applied to any job yet.';

  @override
  String get stylistApplicationStatusSubmitted => 'Submitted';

  @override
  String get stylistApplicationStatusSeen => 'Seen';

  @override
  String get stylistApplicationStatusAccepted => 'Accepted';

  @override
  String get stylistApplicationStatusRejected => 'Rejected';

  @override
  String get businessMenuJobs => 'Job postings';

  @override
  String get businessMenuFloorPlan => 'Floor plan';

  @override
  String get businessMenuAffiliations => 'Affiliations';

  @override
  String get businessMenuProfile => 'Branch profile';

  @override
  String get businessMenuReviews => 'Reviews';

  @override
  String get businessSave => 'Save';

  @override
  String get businessUpdateFailed => 'Could not save. Please try again.';

  @override
  String get businessBrandSuspended =>
      'Your business is suspended, so this branch cannot be used. Contact the business owner or support.';

  @override
  String get businessBranchNotActive =>
      'This branch is not active right now: it or its business may be suspended or switched off. Contact the business owner or support.';

  @override
  String get businessFeatureNotEnabled =>
      'This feature is not part of your current plan. Upgrade to use it.';

  @override
  String get businessJobsTitle => 'Job postings';

  @override
  String get businessJobsEmpty => 'No job postings yet.';

  @override
  String get businessJobAdd => 'Add job posting';

  @override
  String get businessJobNewTitle => 'New job posting';

  @override
  String get businessJobEditTitle => 'Edit job posting';

  @override
  String get businessJobTitleEnglish => 'Title (English)';

  @override
  String get businessJobTitleArabic => 'Title (Arabic)';

  @override
  String get businessJobDescriptionEnglish => 'Description (English)';

  @override
  String get businessJobDescriptionArabic => 'Description (Arabic)';

  @override
  String get businessJobLocation => 'Location';

  @override
  String get businessJobType => 'Type';

  @override
  String get businessJobFieldRequired => 'Required';

  @override
  String get businessJobDelete => 'Delete';

  @override
  String get businessJobApplicants => 'Applicants';

  @override
  String get businessApplicantsEmpty => 'No applications yet.';

  @override
  String get businessApplicantAccept => 'Accept';

  @override
  String get businessApplicantReject => 'Reject';

  @override
  String get businessApplicationStatusSubmitted => 'Submitted';

  @override
  String get businessApplicationStatusSeen => 'Seen';

  @override
  String get businessApplicationStatusAccepted => 'Accepted';

  @override
  String get businessApplicationStatusRejected => 'Rejected';

  @override
  String get businessFloorPlanTitle => 'Floor plan';

  @override
  String get businessFloorPlanPresetStandard => 'Standard';

  @override
  String get businessFloorPlanPresetCompact => 'Compact';

  @override
  String get businessFloorPlanPresetUnisexZoned => 'Unisex zoned';

  @override
  String get businessAffiliationsTitle => 'Affiliations';

  @override
  String get businessAffiliationsEmpty => 'No affiliation requests.';

  @override
  String get businessAffiliationsPending => 'Pending requests';

  @override
  String get businessAffiliationsOthers => 'Other affiliations';

  @override
  String get businessAffiliationAccept => 'Accept';

  @override
  String get businessAffiliationReject => 'Reject';

  @override
  String get businessAffiliationStatusPending => 'Pending';

  @override
  String get businessAffiliationStatusActive => 'Active';

  @override
  String get businessAffiliationStatusRejected => 'Rejected';

  @override
  String get businessAffiliationStatusTerminated => 'Terminated';

  @override
  String get businessProfileTitle => 'Branch profile';

  @override
  String get businessProfileDescriptionEnglish => 'Description (English)';

  @override
  String get businessProfileDescriptionArabic => 'Description (Arabic)';

  @override
  String get businessProfileAddressEnglish => 'Address (English)';

  @override
  String get businessProfileAddressArabic => 'Address (Arabic)';

  @override
  String get businessProfileTagsEnglish => 'Tags (English, comma separated)';

  @override
  String get businessProfileTagsArabic => 'Tags (Arabic, comma separated)';

  @override
  String get businessReviewsTitle => 'Reviews';

  @override
  String get businessReviewsEmpty => 'No reviews yet.';

  @override
  String businessReviewRating(int rating) {
    return '$rating / 5';
  }

  @override
  String get reviewDisputeAction => 'Dispute';

  @override
  String get reviewDisputeTitle => 'Dispute this review';

  @override
  String get reviewDisputeReasonLabel => 'Why is this review wrong?';

  @override
  String reviewDisputeReasonTooShort(int min) {
    return 'Enter at least $min characters';
  }

  @override
  String get reviewDisputeCancel => 'Cancel';

  @override
  String get reviewDisputeSubmit => 'Submit dispute';

  @override
  String get reviewDisputeUnderReview => 'Under admin review';

  @override
  String get reviewDisputeSent => 'Dispute sent. An admin will review it.';

  @override
  String get stylistMenuReviews => 'Reviews';

  @override
  String get stylistReviewsTitle => 'Reviews';

  @override
  String get stylistReviewsEmpty => 'No reviews yet.';

  @override
  String stylistReviewRating(int rating) {
    return '$rating / 5';
  }

  @override
  String get stylistClientHistoryAction => 'Visit history';

  @override
  String get stylistClientHistoryTitle => 'Client history';

  @override
  String get stylistClientHistoryEmpty =>
      'No visits recorded for this client yet.';

  @override
  String get stylistHistoryVisitFallback => 'Visit';

  @override
  String get stylistHistoryPhotoAdded => 'Photo added.';

  @override
  String get staffTabHome => 'Home';

  @override
  String get staffTabInbox => 'Inbox';

  @override
  String get staffTabMore => 'More';

  @override
  String get staffMoreTitle => 'More';

  @override
  String get staffEarningsTitle => 'Earnings';

  @override
  String get staffEarningsEmpty => 'No completed bookings in this period.';

  @override
  String get staffEarningsRangeMonth => 'This month';

  @override
  String get staffEarningsRangeAll => 'All time';

  @override
  String get staffEarningsGross => 'Gross';

  @override
  String get staffEarningsCommission => 'Commission';

  @override
  String get staffEarningsNet => 'Net';

  @override
  String get staffEarningsNetUnavailable => 'Not available';

  @override
  String staffEarningsBookings(int count) {
    return '$count completed bookings';
  }

  @override
  String get staffInboxTitle => 'Inbox';

  @override
  String get staffServiceNameEn => 'Name (English)';

  @override
  String get staffServiceNameAr => 'Name (Arabic)';

  @override
  String get staffServicePrice => 'Price';

  @override
  String get staffServiceCurrency => 'Currency code';

  @override
  String get staffServiceDuration => 'Duration (minutes)';

  @override
  String get staffServiceAtHome => 'Offered at home';

  @override
  String get staffServiceActive => 'Active';

  @override
  String get staffServiceInactive => 'Inactive';

  @override
  String get staffServiceAdd => 'Add service';

  @override
  String get staffServiceEditTitle => 'Edit service';

  @override
  String get staffServiceNewTitle => 'New service';

  @override
  String get staffServiceSave => 'Save service';

  @override
  String get staffServiceDelete => 'Delete';

  @override
  String get staffServiceDeleteTitle => 'Delete this service?';

  @override
  String get staffServiceDeleteMessage =>
      'Clients will no longer be able to book it.';

  @override
  String get staffServiceCancel => 'Cancel';

  @override
  String get staffServiceRequired => 'This field is required.';

  @override
  String get staffServiceInvalidNumber => 'Enter a valid number.';

  @override
  String staffServiceMeta(String price, String currency, int minutes) {
    return '$price $currency · $minutes min';
  }

  @override
  String staffServiceMetaNoDuration(String price, String currency) {
    return '$price $currency';
  }

  @override
  String get businessTabStaff => 'Staff';

  @override
  String get businessTabServices => 'Services';

  @override
  String get businessMenuHours => 'Working hours';

  @override
  String get businessMenuEarnings => 'Earnings';

  @override
  String get businessStaffTitle => 'Staff';

  @override
  String get businessStaffEmpty => 'No stylists work at this branch yet.';

  @override
  String get businessStaffActivate => 'Activate';

  @override
  String get businessStaffDeactivate => 'Deactivate';

  @override
  String get businessStaffStatusEnabled => 'Active';

  @override
  String get businessStaffStatusDisabled => 'Deactivated';

  @override
  String get businessStaffStatusPending => 'Pending';

  @override
  String get businessStaffStatusRejected => 'Rejected';

  @override
  String businessStaffRating(String rating, int count) {
    return '$rating ($count)';
  }

  @override
  String get businessServicesTitle => 'Services';

  @override
  String get businessServicesEmpty =>
      'No services yet. The brand owner adds them.';

  @override
  String get businessHoursTitle => 'Working hours';

  @override
  String get businessHoursClosed => 'Closed';

  @override
  String get businessHoursOpens => 'Opens';

  @override
  String get businessHoursCloses => 'Closes';

  @override
  String get businessHoursInvalidRange =>
      'Closing time must be after opening time.';

  @override
  String get stylistTabHistory => 'History';

  @override
  String get stylistTabEarnings => 'Earnings';

  @override
  String get stylistMenuServices => 'Services and pricing';

  @override
  String get stylistHistoryTitle => 'Past appointments';

  @override
  String get stylistHistoryEmpty => 'No appointments match this filter.';

  @override
  String get stylistHistoryFilterAll => 'All';

  @override
  String get stylistServicesEditorTitle => 'Services and pricing';

  @override
  String get stylistServicesEditorEmpty =>
      'You have no services yet. Add your first one.';

  @override
  String get socialLoginDivider => 'or';

  @override
  String get socialLoginGoogle => 'Continue with Google';

  @override
  String get socialLoginFailed => 'Sign-in failed. Please try again.';

  @override
  String get aboutLegalTitle => 'About and legal';

  @override
  String get legalPrivacyPolicy => 'Privacy policy';

  @override
  String get legalTermsOfService => 'Terms of service';

  @override
  String get legalAboutDorak => 'About Dorak';

  @override
  String get legalContactUs => 'Contact us';

  @override
  String get legalDeleteAccountInfo => 'How to delete your account';

  @override
  String appVersionLabel(String version) {
    return 'Version $version';
  }

  @override
  String get openLinkFailed => 'Couldn\'t open the link. Try again later.';

  @override
  String get feedbackEntry => 'Send feedback';

  @override
  String get feedbackTitle => 'Send feedback';

  @override
  String get feedbackKindLabel => 'What is it about?';

  @override
  String get feedbackKindSuggestion => 'Suggestion';

  @override
  String get feedbackKindBug => 'Bug';

  @override
  String get feedbackKindSupport => 'Support';

  @override
  String get feedbackMessageLabel => 'Your message';

  @override
  String get feedbackMessageHint =>
      'Tell us what happened or what you would like';

  @override
  String get feedbackMessageTooShort => 'Write at least 5 characters.';

  @override
  String get feedbackEmailLabel => 'Your email';

  @override
  String get feedbackEmailInvalid => 'Enter a valid email so we can reply.';

  @override
  String get feedbackSubmit => 'Send';

  @override
  String get feedbackSent => 'Thank you. We received your message.';

  @override
  String get feedbackFailed =>
      'Couldn\'t send your message. Check your connection and try again.';

  @override
  String get feedbackRateLimited =>
      'You sent several messages already. Please try again later.';

  @override
  String get deleteAccountActiveAffiliation =>
      'End your work with your brand or branch first, then delete your account.';

  @override
  String get ownerRoleBranch => 'Branch account';

  @override
  String get ownerRoleOwner => 'Brand owner';

  @override
  String get ownerRoleLabel => 'Sign in as';

  @override
  String get ownerRegisterLink => 'Register as a brand owner on the website';

  @override
  String get ownerHomeTitle => 'My brand';

  @override
  String get ownerBannerPending =>
      'Your brand is waiting for approval. Until then you can edit your brand and add one branch; bookings and billing stay locked.';

  @override
  String ownerBannerRejected(String reason) {
    return 'Your brand was rejected: $reason';
  }

  @override
  String get ownerBannerRejectedNoReason => 'Your brand was rejected.';

  @override
  String get ownerBannerSuspended =>
      'Your brand is suspended. You can view everything, but nothing can be changed.';

  @override
  String get ownerResubmit => 'Send for another review';

  @override
  String get ownerResubmitted => 'Sent for review.';

  @override
  String get ownerBrandActive => 'Active';

  @override
  String get ownerBrandPending => 'Pending approval';

  @override
  String get ownerBrandRejected => 'Rejected';

  @override
  String get ownerBrandSuspended => 'Suspended';

  @override
  String get ownerNoBrandTitle => 'No brand on this account';

  @override
  String get ownerNoBrandBody =>
      'Brand owner registration happens on the website. Register there, then sign in again.';

  @override
  String get ownerMenuBranches => 'Branches';

  @override
  String get ownerMenuServices => 'Services';

  @override
  String get ownerMenuBilling => 'Plan and payouts';

  @override
  String get ownerBranchesTitle => 'Branches';

  @override
  String get ownerBranchesEmpty => 'No branches yet.';

  @override
  String get ownerBranchAdd => 'Add a branch';

  @override
  String get ownerBranchEdit => 'Edit branch';

  @override
  String get ownerBranchNameEn => 'Name (English)';

  @override
  String get ownerBranchNameAr => 'Name (Arabic)';

  @override
  String get ownerBranchEmail => 'Branch login email';

  @override
  String get ownerBranchPassword => 'Branch login password';

  @override
  String get ownerBranchPasswordKeep =>
      'Leave empty to keep the current password';

  @override
  String get ownerBranchSave => 'Save branch';

  @override
  String get ownerBranchSaved => 'Branch saved.';

  @override
  String get ownerBranchOn => 'Open';

  @override
  String get ownerBranchOff => 'Closed';

  @override
  String get ownerErrorBrandNotApproved =>
      'This is available after your brand is approved.';

  @override
  String get ownerErrorReadOnly => 'A suspended brand cannot be changed.';

  @override
  String get ownerBillingTitle => 'Plan and payouts';

  @override
  String get ownerSubscriptionTitle => 'Plan';

  @override
  String get ownerNoSubscription => 'No plan yet.';

  @override
  String ownerPlanLine(String plan, String status) {
    return '$plan · $status';
  }

  @override
  String get ownerPayoutsTitle => 'Payouts';

  @override
  String get ownerPayoutsEmpty => 'No payouts yet.';

  @override
  String ownerPayoutLine(String amount, String currency, String status) {
    return '$amount $currency · $status';
  }

  @override
  String get ownerServicesTitle => 'Services';

  @override
  String get ownerServicesEmpty => 'No services yet.';

  @override
  String get ownerServiceAdd => 'Add a service';

  @override
  String get ownerServiceEdit => 'Edit service';

  @override
  String get ownerServiceName => 'Name';

  @override
  String get ownerServicePrice => 'Price';

  @override
  String get ownerServiceCurrency => 'Currency code';

  @override
  String get ownerServiceDuration => 'Duration (minutes)';

  @override
  String get ownerServiceSave => 'Save service';

  @override
  String get ownerServiceSaved => 'Service saved.';

  @override
  String get ownerServiceDelete => 'Delete service';

  @override
  String get ownerFieldInvalidNumber => 'Enter a valid number';
}
