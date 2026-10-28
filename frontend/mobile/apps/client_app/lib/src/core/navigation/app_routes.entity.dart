class AppRoutes {
  AppRoutes._();

  static const String splash = '/splash';

  static const String onboarding = '/onboarding';
  static const String onboardingWelcome = '/onboarding/welcome';
  static const String onboardingDiscovery = '/onboarding/discovery';
  static const String onboardingBooking = '/onboarding/booking';
  static const String onboardingAiStyle = '/onboarding/ai-style';

  static const String authEntry = '/auth';
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authVerify = '/auth/verify';
  static const String authForgotPassword = '/auth/forgot-password';
  static const String authRecoveryOtp = '/auth/forgot-password/otp';
  static const String authResetPassword = '/auth/reset-password';
  static const String authResetPasswordSuccess = '/auth/reset-password/success';
  static const String profileCompletion = '/profile-completion';
  static const String phoneVerify = '/profile/phone-verify';

  // Main shell routes (StatefulShellRoute)
  static const String discover = '/discover';
  static const String bookings = '/bookings';
  static const String favorites = '/favorites';
  static const String profile = '/profile';
  static const String profilePassword = '/profile/password';
  static const String profileDelete = '/profile/delete';
  static const String profileDiscoveryPreferences =
      '/profile/discovery-preferences';
  static const String profileEdit = '/profile/edit';
  static const String profileAddresses = '/profile/addresses';
  static const String profileNotifications = '/profile/notifications';
  static const String profileSettings = '/profile/settings';

  static const String branchDetailSegment = 'branch/:branchId';
  static const String branchReviewsSegment = 'reviews';
  static const String discoverBarberSegment = 'barber/:barberId';
  static const String reviewSegment = 'reviews/:bookingId';
  static const String bookingTrackerSegment = ':bookingId/tracker';
  static const String bookingDetailsSegment = 'details/:bookingId';

  static const String barberQueryKey = 'barberId';
  static const String servicesQueryKey = 'serviceIds';

  static String branchDetail(String branchId) => '$discover/branch/$branchId';
  static String branchReviews(String branchId) =>
      '${branchDetail(branchId)}/reviews';
  static String branchBooking(
    String branchId, {
    required String barberId,
    required List<String> serviceIds,
  }) => Uri(
    path: branchDetail(branchId),
    queryParameters: {
      barberQueryKey: barberId,
      servicesQueryKey: serviceIds.join(','),
    },
  ).toString();
  static String barberDetail(String barberId) => '$discover/barber/$barberId';

  static String reviewDetail(String bookingId) =>
      '$bookings/reviews/$bookingId';

  static String bookingTracker(String bookingId) =>
      '$bookings/$bookingId/tracker';
  static String bookingDetails(String bookingId) =>
      '$bookings/details/$bookingId';

  // Legacy home route (kept for onboarding/guest redirects)
  static const String home = '/home';

  static const String welcomeSegment = 'welcome';
  static const String discoverySegment = 'discovery';
  static const String bookingSegment = 'booking';
  static const String aiStyleSegment = 'ai-style';
  static const String loginSegment = 'login';
  static const String registerSegment = 'register';
  static const String verifySegment = 'verify';
  static const String forgotPasswordSegment = 'forgot-password';
  static const String recoveryOtpSegment = 'otp';
  static const String resetPasswordSegment = 'reset-password';
  static const String resetPasswordSuccessSegment = 'success';
  static const String profilePasswordSegment = 'password';
  static const String profileDeleteSegment = 'delete';
  static const String profileDiscoveryPreferencesSegment =
      'discovery-preferences';
  static const String profileEditSegment = 'edit';
  static const String profileAddressesSegment = 'addresses';
  static const String profileNotificationsSegment = 'notifications';
  static const String profileSettingsSegment = 'settings';
}
