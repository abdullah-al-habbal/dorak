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
  String get homeTitle => 'Home';

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
  String get errorTitleOffline => 'You\'re offline';

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
  String get bookingsActionLabel => 'Discover';

  @override
  String get favoritesTitle => 'No favorites yet';

  @override
  String get favoritesSubtitle =>
      'Tap the heart on a salon or barber to save it here.';

  @override
  String get favoritesActionLabel => 'Discover';

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileSubtitle =>
      'Your account and preferences will appear here.';

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
  String get changePasswordNewLabel => 'New Password';

  @override
  String get changePasswordConfirmLabel => 'Confirm New Password';

  @override
  String get changePasswordSubmit => 'Update Password';

  @override
  String get changePasswordSuccessTitle => 'Password Updated';

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
  String get bookingStatusCanceled => 'Canceled';

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
  String branchChairsCount(int count) {
    return '$count chairs';
  }

  @override
  String get branchAvailableLabel => 'Available';

  @override
  String get branchOccupiedLabel => 'Occupied';

  @override
  String get branchMaintenanceLabel => 'Maintenance';

  @override
  String get branchBarbersTitle => 'Barbers';

  @override
  String get branchServicesTitle => 'Services';

  @override
  String get bookingSelectChair => 'Select a chair';

  @override
  String get bookingSelectServices => 'Select services';

  @override
  String get bookingSelectTime => 'Select time';

  @override
  String get bookingSelectDate => 'Select date';

  @override
  String get bookingNoSlots => 'No available slots';

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
  String get historyRebookTitle => 'Book Again';

  @override
  String historyRebookMessage(String item) {
    return 'Pick a new time for $item.';
  }

  @override
  String get historyRebookSuccessTitle => 'Booked Again';

  @override
  String get historyRebookSuccessMessage =>
      'Your new slot is reserved. Find it in Bookings.';

  @override
  String get profileMemberLabel => 'Member';

  @override
  String get avatarUpdateAction => 'Change Photo';

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
  String get reviewCommentHint => 'Share more details... (optional)';

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
  String reviewStarLabel(int stars) {
    return '$stars out of 5 stars';
  }

  @override
  String get reviewCommentsSection => 'Reviews';

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
  String get bookingSavedAddressesLabel => 'Saved addresses';

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
  String get bookingTrackerCancelled => 'This appointment was cancelled.';

  @override
  String get bookingTrackAction => 'Track appointment';

  @override
  String get profileEditAction => 'Edit profile';

  @override
  String get profileSavedAddressesAction => 'Saved addresses';

  @override
  String get profileEditTitle => 'Edit profile';

  @override
  String get profileSaveAction => 'Save';

  @override
  String get profileFullNameLabel => 'Full name';

  @override
  String get profilePhoneNumberLabel => 'Phone number';

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
  String get chairStatusAvailable => 'Available';

  @override
  String get chairStatusOccupied => 'Occupied';

  @override
  String get chairStatusMaintenance => 'Under maintenance';

  @override
  String get chairStatusUnknown => 'Unknown status';

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
}
