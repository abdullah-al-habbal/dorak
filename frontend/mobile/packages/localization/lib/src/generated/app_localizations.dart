import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ar'),
  ];

  /// App brand name displayed on splash screen
  ///
  /// In en, this message translates to:
  /// **'Dorak'**
  String get splashTitle;

  /// Skip button label
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get skip;

  /// Welcome screen headline
  ///
  /// In en, this message translates to:
  /// **'Your grooming experience, reimagined.'**
  String get onboardingWelcomeTitle;

  /// Welcome screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Discover top-tier professionals, book with ease, and personalize your style journey.'**
  String get onboardingWelcomeSubtitle;

  /// Primary CTA on welcome screen
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get onboardingGetStarted;

  /// Skip bottom sheet title
  ///
  /// In en, this message translates to:
  /// **'Skip Onboarding?'**
  String get skipOnboardingQuestion;

  /// Skip bottom sheet primary action
  ///
  /// In en, this message translates to:
  /// **'Skip for now'**
  String get skipForNow;

  /// Skip bottom sheet secondary action
  ///
  /// In en, this message translates to:
  /// **'Don\'t show again'**
  String get dontShowAgain;

  /// Skip bottom sheet cancel action
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Discovery screen headline
  ///
  /// In en, this message translates to:
  /// **'Find the perfect fit.'**
  String get discoveryTitle;

  /// Discovery screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Explore nearby shops, expert barbers, and premium services tailored to your needs.'**
  String get discoverySubtitle;

  /// Discovery screen primary CTA
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// Discovery card 1 label
  ///
  /// In en, this message translates to:
  /// **'Shops'**
  String get discoveryCardShops;

  /// Discovery card 2 label
  ///
  /// In en, this message translates to:
  /// **'Barbers'**
  String get discoveryCardBarbers;

  /// Discovery card 3 label
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get discoveryCardServices;

  /// Discovery screen back action
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get previous;

  /// Locale toggle label to switch to Arabic
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get localeArabic;

  /// Locale toggle label to switch to English
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get localeEnglish;

  /// Booking innovation screen headline
  ///
  /// In en, this message translates to:
  /// **'Book when it works for you.'**
  String get bookingTitle;

  /// Booking innovation screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Choose your service, professional, and time — then book in just a few taps.'**
  String get bookingSubtitle;

  /// Booking demo service card label
  ///
  /// In en, this message translates to:
  /// **'Premium Fade'**
  String get bookingServiceLabel;

  /// Booking demo service card meta
  ///
  /// In en, this message translates to:
  /// **'45 min • \$65'**
  String get bookingServiceMeta;

  /// Booking demo professional name
  ///
  /// In en, this message translates to:
  /// **'Marcus T.'**
  String get bookingProfessionalLabel;

  /// Booking demo professional rating
  ///
  /// In en, this message translates to:
  /// **'4.9'**
  String get bookingProfessionalRating;

  /// Booking demo date label
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get bookingDateLabel;

  /// Booking demo time label
  ///
  /// In en, this message translates to:
  /// **'2:30 PM'**
  String get bookingTimeLabel;

  /// AI feature showcase screen headline
  ///
  /// In en, this message translates to:
  /// **'Discover styles made for you.'**
  String get aiTitle;

  /// AI feature showcase screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Get personalized style recommendations based on your preferences and, if you choose, your face profile.'**
  String get aiSubtitle;

  /// AI demo match card label
  ///
  /// In en, this message translates to:
  /// **'98% Match'**
  String get aiMatchLabel;

  /// AI demo recommendation card label
  ///
  /// In en, this message translates to:
  /// **'Recommended'**
  String get aiRecommendedLabel;

  /// AI demo recommended style one
  ///
  /// In en, this message translates to:
  /// **'Premium Fade'**
  String get aiStyleFade;

  /// AI demo recommended style two
  ///
  /// In en, this message translates to:
  /// **'Textured Crop'**
  String get aiStyleCrop;

  /// AI demo face shape chip label
  ///
  /// In en, this message translates to:
  /// **'Face Shape: Oval'**
  String get aiFaceShapeLabel;

  /// AI demo privacy note
  ///
  /// In en, this message translates to:
  /// **'Face analysis is entirely optional.'**
  String get aiPrivacyNote;

  /// Auth entry screen title
  ///
  /// In en, this message translates to:
  /// **'Welcome to Dorak'**
  String get authWelcomeTitle;

  /// Auth entry screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Sign in to access your personalized experience, or continue as a guest to explore.'**
  String get authSubtitle;

  /// Auth entry primary CTA
  ///
  /// In en, this message translates to:
  /// **'Log In'**
  String get authLogIn;

  /// Auth entry secondary CTA
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get authCreateAccount;

  /// Auth entry guest action
  ///
  /// In en, this message translates to:
  /// **'Continue as Guest'**
  String get authContinueAsGuest;

  /// Auth entry guest helper text
  ///
  /// In en, this message translates to:
  /// **'Explore Dorak without creating an account.'**
  String get authGuestHint;

  /// Back button tooltip
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// Login screen title
  ///
  /// In en, this message translates to:
  /// **'Welcome Back'**
  String get loginTitle;

  /// Login screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Sign in to your account'**
  String get loginSubtitle;

  /// Login email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get loginEmailLabel;

  /// Login password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get loginPasswordLabel;

  /// Login forgot password link
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get loginForgotPassword;

  /// Login submit button
  ///
  /// In en, this message translates to:
  /// **'Log In'**
  String get loginButton;

  /// Login footer prompt before the sign-up link
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get loginSignUpPrompt;

  /// Login footer sign-up link
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get loginCreateAccountLink;

  /// Login 401 error message
  ///
  /// In en, this message translates to:
  /// **'Invalid email or password'**
  String get loginErrorInvalidCredentials;

  /// Shown when a ban prevents login or ends an active session
  ///
  /// In en, this message translates to:
  /// **'This account is suspended. Contact support for help.'**
  String get authAccountSuspended;

  /// Shown when login is blocked because the account is pending or disabled
  ///
  /// In en, this message translates to:
  /// **'This account is not active. Complete verification or contact support.'**
  String get authAccountNotActive;

  /// Sign-up screen title
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get signUpTitle;

  /// Sign-up screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Join Dorak for personalized grooming and effortless booking.'**
  String get signUpSubtitle;

  /// Sign-up full name field label
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get signUpFullNameLabel;

  /// Sign-up email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get signUpEmailLabel;

  /// Sign-up password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get signUpPasswordLabel;

  /// Sign-up confirm password field label
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get signUpConfirmPasswordLabel;

  /// Sign-up password requirement hint
  ///
  /// In en, this message translates to:
  /// **'At least 8 characters'**
  String get signUpPasswordHint;

  /// Sign-up submit button
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get signUpButton;

  /// Sign-up footer prompt before the login link
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get signUpAlreadyHaveAccount;

  /// Sign-up footer login link
  ///
  /// In en, this message translates to:
  /// **'Log In'**
  String get signUpLogInLink;

  /// Verify account screen title
  ///
  /// In en, this message translates to:
  /// **'Verify Your Account'**
  String get verifyTitle;

  /// Verify account subtitle with the masked destination
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-digit code we sent to {email}'**
  String verifySubtitle(String email);

  /// Verify account submit button
  ///
  /// In en, this message translates to:
  /// **'Verify & Continue'**
  String get verifyButton;

  /// Verify account resend prompt
  ///
  /// In en, this message translates to:
  /// **'Didn\'t receive the code?'**
  String get verifyDidNotReceive;

  /// Verify account resend action
  ///
  /// In en, this message translates to:
  /// **'Resend Code'**
  String get verifyResend;

  /// Verify account resend action during cooldown
  ///
  /// In en, this message translates to:
  /// **'Resend Code ({seconds}s)'**
  String verifyResendDisabled(int seconds);

  /// Verify account invalid code error
  ///
  /// In en, this message translates to:
  /// **'Invalid code. Please try again.'**
  String get verifyErrorInvalid;

  /// Verify account skip action
  ///
  /// In en, this message translates to:
  /// **'Verify later'**
  String get verifySkip;

  /// Form validation error for an empty required field
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get fieldRequired;

  /// Generic localized validation error when server details are unavailable
  ///
  /// In en, this message translates to:
  /// **'Please check this field'**
  String get fieldInvalid;

  /// Form validation error for a malformed email
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address'**
  String get fieldInvalidEmail;

  /// Form validation error for a short password
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get fieldPasswordTooShort;

  /// Form validation error when confirm password differs
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get fieldPasswordMismatch;

  /// Transport failure message
  ///
  /// In en, this message translates to:
  /// **'No connection. Check your network and try again.'**
  String get errorNetwork;

  /// Fallback error message
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get errorGeneric;

  /// Retry action label for failed states
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get actionRetry;

  /// Fallback error state title
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get errorTitleGeneric;

  /// Offline state title
  ///
  /// In en, this message translates to:
  /// **'You\'re offline'**
  String get errorTitleOffline;

  /// Fallback empty state title
  ///
  /// In en, this message translates to:
  /// **'Nothing here yet'**
  String get emptyTitleGeneric;

  /// Fallback empty state message
  ///
  /// In en, this message translates to:
  /// **'There\'s nothing to show right now.'**
  String get emptyMessageGeneric;

  /// recoveryEmailTitle
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get recoveryEmailTitle;

  /// recoveryEmailSubtitle
  ///
  /// In en, this message translates to:
  /// **'Enter the email on your account and we\'ll send you a 6-digit reset code.'**
  String get recoveryEmailSubtitle;

  /// recoveryEmailLabel
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get recoveryEmailLabel;

  /// recoverySendCodeButton
  ///
  /// In en, this message translates to:
  /// **'Send Code'**
  String get recoverySendCodeButton;

  /// recoveryReturnToLogIn
  ///
  /// In en, this message translates to:
  /// **'Return to Log In'**
  String get recoveryReturnToLogIn;

  /// recoveryOtpTitle
  ///
  /// In en, this message translates to:
  /// **'Enter Reset Code'**
  String get recoveryOtpTitle;

  /// recoveryOtpSubtitle
  ///
  /// In en, this message translates to:
  /// **'If {email} is registered, we\'ve sent it a 6-digit code. It expires in 10 minutes.'**
  String recoveryOtpSubtitle(String email);

  /// recoveryOtpContinueButton
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get recoveryOtpContinueButton;

  /// recoveryOtpIncomplete
  ///
  /// In en, this message translates to:
  /// **'Enter all 6 digits'**
  String get recoveryOtpIncomplete;

  /// recoveryResend
  ///
  /// In en, this message translates to:
  /// **'Resend Code'**
  String get recoveryResend;

  /// recoveryResendDisabled
  ///
  /// In en, this message translates to:
  /// **'Resend Code ({seconds}s)'**
  String recoveryResendDisabled(int seconds);

  /// recoveryDidNotReceive
  ///
  /// In en, this message translates to:
  /// **'Didn\'t receive the code?'**
  String get recoveryDidNotReceive;

  /// recoveryNewPasswordTitle
  ///
  /// In en, this message translates to:
  /// **'Create New Password'**
  String get recoveryNewPasswordTitle;

  /// recoveryNewPasswordSubtitle
  ///
  /// In en, this message translates to:
  /// **'Choose a new password for your account.'**
  String get recoveryNewPasswordSubtitle;

  /// recoveryNewPasswordLabel
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get recoveryNewPasswordLabel;

  /// recoveryConfirmPasswordLabel
  ///
  /// In en, this message translates to:
  /// **'Confirm New Password'**
  String get recoveryConfirmPasswordLabel;

  /// recoveryResetButton
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get recoveryResetButton;

  /// recoveryCodeRejected
  ///
  /// In en, this message translates to:
  /// **'That code is invalid or has expired.'**
  String get recoveryCodeRejected;

  /// Error when password-reset code checks are rate limited
  ///
  /// In en, this message translates to:
  /// **'Too many attempts. Please wait a minute and try again.'**
  String get recoveryCodeThrottled;

  /// recoveryReenterCode
  ///
  /// In en, this message translates to:
  /// **'Re-enter code'**
  String get recoveryReenterCode;

  /// passwordResetSuccessTitle
  ///
  /// In en, this message translates to:
  /// **'Password Updated'**
  String get passwordResetSuccessTitle;

  /// passwordResetSuccessMessage
  ///
  /// In en, this message translates to:
  /// **'Your password has been changed. You can now log in with your new password.'**
  String get passwordResetSuccessMessage;

  /// onboardingConfigUnavailable
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load the latest artwork.'**
  String get onboardingConfigUnavailable;

  /// Bookings screen empty state title
  ///
  /// In en, this message translates to:
  /// **'No bookings yet'**
  String get bookingsTitle;

  /// Bookings screen empty state subtitle
  ///
  /// In en, this message translates to:
  /// **'Your upcoming and past bookings will appear here.'**
  String get bookingsSubtitle;

  /// Favorites screen empty state title
  ///
  /// In en, this message translates to:
  /// **'No favorites yet'**
  String get favoritesTitle;

  /// Favorites screen empty state subtitle
  ///
  /// In en, this message translates to:
  /// **'Tap the heart on a salon or barber to save it here.'**
  String get favoritesSubtitle;

  /// Favorites empty state action button label
  ///
  /// In en, this message translates to:
  /// **'Discover'**
  String get favoritesActionLabel;

  /// Profile empty state action button label
  ///
  /// In en, this message translates to:
  /// **'Discover'**
  String get profileActionLabel;

  /// Location required screen title
  ///
  /// In en, this message translates to:
  /// **'Location Required'**
  String get locationRequiredTitle;

  /// Location required screen message
  ///
  /// In en, this message translates to:
  /// **'Enable location access to discover nearby branches.'**
  String get locationRequiredMessage;

  /// Enable location action button label
  ///
  /// In en, this message translates to:
  /// **'Enable Location'**
  String get enableLocationAction;

  /// Available now filter label
  ///
  /// In en, this message translates to:
  /// **'Available Now'**
  String get availableNow;

  /// Price filter label
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get price;

  /// Rating filter label
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get rating;

  /// Distance filter label
  ///
  /// In en, this message translates to:
  /// **'Distance'**
  String get distance;

  /// View details button label
  ///
  /// In en, this message translates to:
  /// **'View Details'**
  String get viewDetails;

  /// Book now button label
  ///
  /// In en, this message translates to:
  /// **'Book Now'**
  String get bookNow;

  /// Universe switcher option for men-only branches
  ///
  /// In en, this message translates to:
  /// **'Men'**
  String get discoverUniverseMen;

  /// Universe switcher option for women-only branches
  ///
  /// In en, this message translates to:
  /// **'Women'**
  String get discoverUniverseWomen;

  /// Caption confirming results are ordered by distance
  ///
  /// In en, this message translates to:
  /// **'Ranked by distance'**
  String get discoverRankedByDistance;

  /// Badge on a freelancer result in discovery
  ///
  /// In en, this message translates to:
  /// **'Freelancer'**
  String get discoverFreelancerBadge;

  /// Shown instead of a distance for a freelancer without a fixed location
  ///
  /// In en, this message translates to:
  /// **'Travels to you'**
  String get discoverTravelsToYou;

  /// Hint of the discovery keyword search field
  ///
  /// In en, this message translates to:
  /// **'Search shops, brands or services'**
  String get discoverSearchHint;

  /// Average rating and review count of a branch or barber
  ///
  /// In en, this message translates to:
  /// **'★ {rating} ({count, plural, =1{1 review} other{{count} reviews}})'**
  String ratingSummary(String rating, int count);

  /// Shown instead of a rating when a branch or barber has no published reviews
  ///
  /// In en, this message translates to:
  /// **'No reviews yet'**
  String get ratingNoReviews;

  /// Distance in kilometres shown on a result card
  ///
  /// In en, this message translates to:
  /// **'{km} km'**
  String discoverDistanceLabel(double km);

  /// Badge shown when the feed renders from a cached fetch
  ///
  /// In en, this message translates to:
  /// **'Showing saved results'**
  String get discoverStaleLabel;

  /// Rank position badge on a result card
  ///
  /// In en, this message translates to:
  /// **'#{rank}'**
  String discoverRankBadge(int rank);

  /// Discover tab label in the bottom navigation bar
  ///
  /// In en, this message translates to:
  /// **'Discover'**
  String get discoverTabLabel;

  /// Change password screen title
  ///
  /// In en, this message translates to:
  /// **'Change Password'**
  String get changePasswordTitle;

  /// Change password screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Enter your current password, then choose a new one.'**
  String get changePasswordSubtitle;

  /// Current password field label
  ///
  /// In en, this message translates to:
  /// **'Current Password'**
  String get changePasswordCurrentLabel;

  /// New password field label
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get changePasswordNewLabel;

  /// Confirm new password field label
  ///
  /// In en, this message translates to:
  /// **'Confirm New Password'**
  String get changePasswordConfirmLabel;

  /// Change password submit button label
  ///
  /// In en, this message translates to:
  /// **'Update Password'**
  String get changePasswordSubmit;

  /// Change password success title
  ///
  /// In en, this message translates to:
  /// **'Password Updated'**
  String get changePasswordSuccessTitle;

  /// Change password success message
  ///
  /// In en, this message translates to:
  /// **'Your password has been changed.'**
  String get changePasswordSuccessMessage;

  /// Change password success dismiss button label
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get changePasswordDone;

  /// Bookings tab label in the bottom navigation bar
  ///
  /// In en, this message translates to:
  /// **'Bookings'**
  String get bookingsTabLabel;

  /// Bookings filter option for upcoming bookings
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get bookingFilterUpcoming;

  /// Bookings filter option for past bookings
  ///
  /// In en, this message translates to:
  /// **'Past'**
  String get bookingFilterPast;

  /// Booking status badge for confirmed bookings
  ///
  /// In en, this message translates to:
  /// **'Confirmed'**
  String get bookingStatusConfirmed;

  /// Booking status badge for cancelled bookings
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get bookingStatusCancelled;

  /// Booking status badge for completed bookings
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get bookingStatusCompleted;

  /// Booking card barber attribution line
  ///
  /// In en, this message translates to:
  /// **'with {name}'**
  String bookingWithBarber(String name);

  /// Booking card chair line
  ///
  /// In en, this message translates to:
  /// **'Chair {label}'**
  String bookingChairLabel(String label);

  /// Cancel booking button label
  ///
  /// In en, this message translates to:
  /// **'Cancel Booking'**
  String get bookingCancelAction;

  /// Cancel booking confirmation dialog title
  ///
  /// In en, this message translates to:
  /// **'Cancel this booking?'**
  String get bookingCancelConfirmTitle;

  /// Cancel booking confirmation dialog message
  ///
  /// In en, this message translates to:
  /// **'Your slot will be freed. You can book again anytime.'**
  String get bookingCancelConfirmMessage;

  /// Cancel booking confirmation dialog confirm button
  ///
  /// In en, this message translates to:
  /// **'Yes, Cancel'**
  String get bookingCancelConfirm;

  /// Heading of the selected chair's services when a barber sits there
  ///
  /// In en, this message translates to:
  /// **'Services by {name}'**
  String branchChairBarberServices(String name);

  /// Heading of the services shown for a chair with no seated barber
  ///
  /// In en, this message translates to:
  /// **'Shop menu'**
  String get branchChairShopMenu;

  /// Shown when the selected chair has no services
  ///
  /// In en, this message translates to:
  /// **'No services are listed for this chair yet.'**
  String get branchChairNoServices;

  /// Heading of the list of shops a stylist works at
  ///
  /// In en, this message translates to:
  /// **'Works at'**
  String get stylistWorkplacesTitle;

  /// A workplace with the chair the stylist sits at
  ///
  /// In en, this message translates to:
  /// **'{place} · {chair}'**
  String stylistWorkplaceChair(String place, String chair);

  /// Branch detail chairs count line
  ///
  /// In en, this message translates to:
  /// **'{count} chairs'**
  String branchChairsCount(int count);

  /// Floor plan legend for available chairs
  ///
  /// In en, this message translates to:
  /// **'Available'**
  String get branchAvailableLabel;

  /// Floor plan legend for occupied chairs
  ///
  /// In en, this message translates to:
  /// **'Occupied'**
  String get branchOccupiedLabel;

  /// Branch detail barbers section title
  ///
  /// In en, this message translates to:
  /// **'Barbers'**
  String get branchBarbersTitle;

  /// Booking sheet services step title
  ///
  /// In en, this message translates to:
  /// **'Select services'**
  String get bookingSelectServices;

  /// Booking sheet time step title
  ///
  /// In en, this message translates to:
  /// **'Select time'**
  String get bookingSelectTime;

  /// Booking sheet date step title
  ///
  /// In en, this message translates to:
  /// **'Select date'**
  String get bookingSelectDate;

  /// Shown when the slot list for the selected date is empty
  ///
  /// In en, this message translates to:
  /// **'No available slots'**
  String get bookingNoSlots;

  /// Hint shown while the booking cannot be submitted because no service is selected
  ///
  /// In en, this message translates to:
  /// **'Select a service to continue'**
  String get bookingSelectServiceHint;

  /// Booking sheet confirm button label
  ///
  /// In en, this message translates to:
  /// **'Confirm Booking'**
  String get bookingConfirmAction;

  /// Booking success title
  ///
  /// In en, this message translates to:
  /// **'Booking Confirmed'**
  String get bookingSuccessTitle;

  /// Booking success message
  ///
  /// In en, this message translates to:
  /// **'Your slot is reserved.'**
  String get bookingSuccessMessage;

  /// Booking success navigation button label
  ///
  /// In en, this message translates to:
  /// **'View My Bookings'**
  String get bookingViewBookings;

  /// Message shown when the server reports a booking conflict
  ///
  /// In en, this message translates to:
  /// **'That slot was just taken. Please pick another time.'**
  String get bookingConflictMessage;

  /// Message shown when the server rejects a booking outside the barber schedule
  ///
  /// In en, this message translates to:
  /// **'The requested time is outside the barber schedule.'**
  String get bookingOutsideScheduleMessage;

  /// Shown when the server rejects an at-home booking without a barber
  ///
  /// In en, this message translates to:
  /// **'An at-home booking requires a barber.'**
  String get bookingAtHomeBarberRequiredMessage;

  /// Shown when a selected service is not an at-home service of the barber
  ///
  /// In en, this message translates to:
  /// **'Every service must be an at-home service offered by the selected barber.'**
  String get bookingAtHomeServiceNotEligibleMessage;

  /// Shown when the barber has no travel radius
  ///
  /// In en, this message translates to:
  /// **'This barber does not offer at-home service.'**
  String get bookingAtHomeNotOfferedMessage;

  /// Shown when the client location is beyond the barber travel radius
  ///
  /// In en, this message translates to:
  /// **'Your location is outside the barber\'s travel radius.'**
  String get bookingAtHomeOutOfRadiusMessage;

  /// Compatibility score badge on a result card
  ///
  /// In en, this message translates to:
  /// **'{percent}%'**
  String discoverCompatibilityBadge(int percent);

  /// Service history section title on the profile tab
  ///
  /// In en, this message translates to:
  /// **'Service History'**
  String get historyTitle;

  /// Service history empty state title
  ///
  /// In en, this message translates to:
  /// **'No history yet'**
  String get historyEmptyTitle;

  /// Service history empty state message
  ///
  /// In en, this message translates to:
  /// **'Services you\'ve booked will appear here after their appointment.'**
  String get historyEmptyMessage;

  /// Rebook action on a history entry
  ///
  /// In en, this message translates to:
  /// **'Book Again'**
  String get historyRebookAction;

  /// Rebook success title
  ///
  /// In en, this message translates to:
  /// **'Booked Again'**
  String get historyRebookSuccessTitle;

  /// Rebook success message
  ///
  /// In en, this message translates to:
  /// **'Your new slot is reserved. Find it in Bookings.'**
  String get historyRebookSuccessMessage;

  /// Profile header name fallback when the client name is unknown
  ///
  /// In en, this message translates to:
  /// **'Member'**
  String get profileMemberLabel;

  /// Face analysis module title
  ///
  /// In en, this message translates to:
  /// **'Face Analysis'**
  String get faceAnalysisTitle;

  /// Detected face shape label
  ///
  /// In en, this message translates to:
  /// **'Detected Shape'**
  String get faceAnalysisDetectedShape;

  /// Analysis confidence label
  ///
  /// In en, this message translates to:
  /// **'Confidence'**
  String get faceAnalysisConfidence;

  /// Face photo upload action
  ///
  /// In en, this message translates to:
  /// **'Scan my face'**
  String get faceScanAction;

  /// Pending analysis title
  ///
  /// In en, this message translates to:
  /// **'Analysis in progress'**
  String get faceAnalysisPendingTitle;

  /// Pending analysis message
  ///
  /// In en, this message translates to:
  /// **'We are analyzing your face. Check again in a moment.'**
  String get faceAnalysisPendingMessage;

  /// Empty analysis state title
  ///
  /// In en, this message translates to:
  /// **'No analysis yet'**
  String get faceAnalysisEmptyTitle;

  /// Empty analysis state message
  ///
  /// In en, this message translates to:
  /// **'Upload a photo to discover the styles that suit you.'**
  String get faceAnalysisEmptyMessage;

  /// Re-polls a pending face analysis
  ///
  /// In en, this message translates to:
  /// **'Check again'**
  String get actionCheckAgain;

  /// Detected face shape: oval
  ///
  /// In en, this message translates to:
  /// **'Oval'**
  String get faceShapeOval;

  /// Detected face shape: round
  ///
  /// In en, this message translates to:
  /// **'Round'**
  String get faceShapeRound;

  /// Detected face shape: square
  ///
  /// In en, this message translates to:
  /// **'Square'**
  String get faceShapeSquare;

  /// Detected face shape: heart
  ///
  /// In en, this message translates to:
  /// **'Heart'**
  String get faceShapeHeart;

  /// Detected face shape: diamond
  ///
  /// In en, this message translates to:
  /// **'Diamond'**
  String get faceShapeDiamond;

  /// Detected face shape: oblong
  ///
  /// In en, this message translates to:
  /// **'Oblong'**
  String get faceShapeOblong;

  /// Detected face shape: triangle
  ///
  /// In en, this message translates to:
  /// **'Triangle'**
  String get faceShapeTriangle;

  /// AI style recommendations title
  ///
  /// In en, this message translates to:
  /// **'Curated For You'**
  String get curatedForYouTitle;

  /// Empty recommendations message
  ///
  /// In en, this message translates to:
  /// **'No matching styles yet.'**
  String get curatedEmptyMessage;

  /// Catalog item price range
  ///
  /// In en, this message translates to:
  /// **'{min}–{max} {currency}'**
  String curatedPriceRange(num min, num max, String currency);

  /// Stylist profile services section heading
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get stylistServicesTitle;

  /// Button on the stylist profile that starts a booking with the selected services
  ///
  /// In en, this message translates to:
  /// **'Book'**
  String get stylistBookAction;

  /// Shown when a stylist has no shop workplace to book through
  ///
  /// In en, this message translates to:
  /// **'Booking is available for stylists who work at a shop'**
  String get stylistBookUnavailableHint;

  /// Title and entry button for deleting the client account
  ///
  /// In en, this message translates to:
  /// **'Delete account'**
  String get deleteAccountTitle;

  /// Warning shown above the password field when deleting the account
  ///
  /// In en, this message translates to:
  /// **'Deleting your account is permanent. Enter your password to confirm.'**
  String get deleteAccountWarning;

  /// Password field label on the delete account screen
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get deleteAccountPassword;

  /// Confirm button on the delete account screen
  ///
  /// In en, this message translates to:
  /// **'Delete my account'**
  String get deleteAccountConfirm;

  /// Shown when the password for account deletion is wrong
  ///
  /// In en, this message translates to:
  /// **'The password is incorrect.'**
  String get deleteAccountWrongPassword;

  /// Shown when account deletion is blocked by active bookings
  ///
  /// In en, this message translates to:
  /// **'Cancel or finish your upcoming bookings before deleting your account.'**
  String get deleteAccountActiveBookings;

  /// Button on a history entry that attaches a photo of the result
  ///
  /// In en, this message translates to:
  /// **'Add photo'**
  String get historyAttachPhotoAction;

  /// Title of the sheet asking what kind of photo is being added
  ///
  /// In en, this message translates to:
  /// **'What kind of photo is this?'**
  String get historyMediaTypeTitle;

  /// Photo type: taken before the service
  ///
  /// In en, this message translates to:
  /// **'Before'**
  String get historyMediaTypeBefore;

  /// Photo type: the result after the service
  ///
  /// In en, this message translates to:
  /// **'After'**
  String get historyMediaTypeAfter;

  /// Photo type: inspiration or reference image
  ///
  /// In en, this message translates to:
  /// **'Reference'**
  String get historyMediaTypeReference;

  /// Button that confirms the photo type and opens the photo picker
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get historyMediaTypeContinue;

  /// Shown when attaching a photo to a history entry fails
  ///
  /// In en, this message translates to:
  /// **'The photo could not be added. Try again.'**
  String get historyAttachPhotoFailed;

  /// Title of the branch reviews screen and the button that opens it
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get branchReviewsTitle;

  /// Title shown when a branch has no reviews
  ///
  /// In en, this message translates to:
  /// **'No reviews yet'**
  String get branchReviewsEmptyTitle;

  /// Message shown when a branch has no reviews
  ///
  /// In en, this message translates to:
  /// **'Reviews from clients will appear here.'**
  String get branchReviewsEmptyMessage;

  /// Button that loads the next page of branch reviews
  ///
  /// In en, this message translates to:
  /// **'Load more'**
  String get branchReviewsLoadMore;

  /// Title of the saved filters sheet and the button that opens it
  ///
  /// In en, this message translates to:
  /// **'Saved filters'**
  String get savedFiltersTitle;

  /// Shown when the client has no saved filters
  ///
  /// In en, this message translates to:
  /// **'No saved filters yet.'**
  String get savedFiltersEmpty;

  /// Tooltip for deleting a saved filter
  ///
  /// In en, this message translates to:
  /// **'Delete filter'**
  String get savedFiltersDelete;

  /// Label of the field naming a new saved filter
  ///
  /// In en, this message translates to:
  /// **'Filter name'**
  String get savedFiltersNameLabel;

  /// Button that saves the active discovery filters
  ///
  /// In en, this message translates to:
  /// **'Save current filters'**
  String get savedFiltersSaveCurrent;

  /// Title of the discovery preferences screen and its profile entry
  ///
  /// In en, this message translates to:
  /// **'Discovery preferences'**
  String get discoveryPreferencesTitle;

  /// Switch that includes unavailable shops and barbers in discovery
  ///
  /// In en, this message translates to:
  /// **'Show unavailable results'**
  String get discoveryPreferencesShowUnavailable;

  /// Button that clears the hidden brands list
  ///
  /// In en, this message translates to:
  /// **'Show hidden brands again'**
  String get discoveryPreferencesClearHidden;

  /// Label above the default radius slider
  ///
  /// In en, this message translates to:
  /// **'Default search radius: {km} km'**
  String discoveryPreferencesRadius(int km);

  /// Count of brands hidden from discovery
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one{1 hidden brand} other{{count} hidden brands}}'**
  String discoveryPreferencesHiddenBrands(int count);

  /// Button that opens the list of brands the client can hide
  ///
  /// In en, this message translates to:
  /// **'Choose brands to hide'**
  String get discoveryPreferencesChooseBrands;

  /// Title of the sheet listing brands the client can hide
  ///
  /// In en, this message translates to:
  /// **'Hide brands from discovery'**
  String get brandVisibilityTitle;

  /// Shown when the brand list is empty
  ///
  /// In en, this message translates to:
  /// **'No brands available.'**
  String get brandVisibilityEmpty;

  /// Shown when a stylist has no services
  ///
  /// In en, this message translates to:
  /// **'No services listed yet.'**
  String get stylistNoServicesMessage;

  /// Badge label for services available at home
  ///
  /// In en, this message translates to:
  /// **'At-Home Available'**
  String get serviceAtHomeLabel;

  /// Service duration
  ///
  /// In en, this message translates to:
  /// **'{minutes} min'**
  String serviceDurationLabel(int minutes);

  /// Formatted service price with currency code
  ///
  /// In en, this message translates to:
  /// **'{displayPrice} {currency}'**
  String servicePrice(String displayPrice, String currency);

  /// Stat label for number of services on stylist profile
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get stylistStatServicesLabel;

  /// Stat label for stylist rank
  ///
  /// In en, this message translates to:
  /// **'Rank'**
  String get stylistStatRankLabel;

  /// Stat label for stylist compatibility score
  ///
  /// In en, this message translates to:
  /// **'Compatibility'**
  String get stylistStatCompatibilityLabel;

  /// Review submit screen app bar title
  ///
  /// In en, this message translates to:
  /// **'Rate Your Experience'**
  String get reviewTitle;

  /// Review submit screen rating prompt
  ///
  /// In en, this message translates to:
  /// **'How was your session?'**
  String get reviewStylistPrompt;

  /// Review submit button label
  ///
  /// In en, this message translates to:
  /// **'Submit Review'**
  String get reviewSubmitButton;

  /// Review submit success message
  ///
  /// In en, this message translates to:
  /// **'Review submitted'**
  String get reviewSubmitSuccess;

  /// Shown when the server reports an already-reviewed conflict
  ///
  /// In en, this message translates to:
  /// **'You already reviewed this booking'**
  String get reviewAlreadyReviewed;

  /// Shown when the server reports the booking is not completed
  ///
  /// In en, this message translates to:
  /// **'This booking hasn\'t been completed yet'**
  String get reviewBookingNotCompleted;

  /// Fallback review submit error message
  ///
  /// In en, this message translates to:
  /// **'Could not submit your review'**
  String get reviewErrorGeneric;

  /// Rate action on a completed booking card
  ///
  /// In en, this message translates to:
  /// **'Rate'**
  String get bookingRateAction;

  /// Profile completion screen title
  ///
  /// In en, this message translates to:
  /// **'Complete Your Profile'**
  String get profileCompletionTitle;

  /// Profile completion screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Add your details to personalize your Dorak experience.'**
  String get profileCompletionSubtitle;

  /// Profile completion name field
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get profileCompletionNameLabel;

  /// Profile completion phone field
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get profileCompletionPhoneLabel;

  /// Profile completion submit action
  ///
  /// In en, this message translates to:
  /// **'Save & Continue'**
  String get profileCompletionContinue;

  /// Profile completion generic error
  ///
  /// In en, this message translates to:
  /// **'Could not save your profile'**
  String get profileCompletionError;

  /// Switch label for an at-home booking
  ///
  /// In en, this message translates to:
  /// **'Book at home'**
  String get bookingAtHomeToggle;

  /// At-home booking street field
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get bookingAtHomeStreetLabel;

  /// At-home booking building field
  ///
  /// In en, this message translates to:
  /// **'Building'**
  String get bookingAtHomeBuildingLabel;

  /// At-home booking unit field
  ///
  /// In en, this message translates to:
  /// **'Unit / apartment'**
  String get bookingAtHomeUnitLabel;

  /// Action to select the current GPS location for an at-home booking
  ///
  /// In en, this message translates to:
  /// **'Use current location as GPS pin'**
  String get bookingAtHomePinAction;

  /// Selected at-home GPS coordinates
  ///
  /// In en, this message translates to:
  /// **'GPS pin selected: {latitude}, {longitude}'**
  String bookingAtHomePinSelected(String latitude, String longitude);

  /// At-home GPS selection failure
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t get your GPS location. Check location permission and try again.'**
  String get bookingAtHomeLocationError;

  /// Server-derived booking end time
  ///
  /// In en, this message translates to:
  /// **'Ends {time}'**
  String bookingEndTimeLabel(String time);

  /// Shown when the two-hour booking cancellation cutoff has passed
  ///
  /// In en, this message translates to:
  /// **'Cancellation is unavailable within two hours of the appointment.'**
  String get bookingCancellationClosed;

  /// Published review status indicator
  ///
  /// In en, this message translates to:
  /// **'Published'**
  String get reviewStatusPublished;

  /// Disputed review status indicator
  ///
  /// In en, this message translates to:
  /// **'Under review'**
  String get reviewStatusUnderReview;

  /// Hidden review status indicator
  ///
  /// In en, this message translates to:
  /// **'Hidden'**
  String get reviewStatusHidden;

  /// Resolved review status indicator
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get reviewStatusResolved;

  /// Review dispute workflow notice
  ///
  /// In en, this message translates to:
  /// **'This review is held for up to 48 hours while an administrator resolves the dispute.'**
  String get reviewDisputeHoldNote;

  /// Floor-plan section for men's chairs
  ///
  /// In en, this message translates to:
  /// **'Men\'s zone'**
  String get floorZoneMen;

  /// Floor-plan section for women's chairs
  ///
  /// In en, this message translates to:
  /// **'Women\'s zone'**
  String get floorZoneWomen;

  /// Floor-plan section for shared chairs
  ///
  /// In en, this message translates to:
  /// **'Shared zone'**
  String get floorZoneShared;

  /// Branch manager manual barber creation title
  ///
  /// In en, this message translates to:
  /// **'Add barber'**
  String get managerManualBarberTitle;

  /// Manual barber creation explanation
  ///
  /// In en, this message translates to:
  /// **'Create a barber profile without creating a login account.'**
  String get managerManualBarberSubtitle;

  /// English barber name field
  ///
  /// In en, this message translates to:
  /// **'Name in English'**
  String get managerBarberNameEnglish;

  /// Arabic barber name field
  ///
  /// In en, this message translates to:
  /// **'Name in Arabic'**
  String get managerBarberNameArabic;

  /// Manual barber phone field
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get managerBarberPhone;

  /// E.164 phone input hint
  ///
  /// In en, this message translates to:
  /// **'Include country code, for example +963...'**
  String get managerBarberPhoneHint;

  /// Explains client and barber phone-number sharing
  ///
  /// In en, this message translates to:
  /// **'A client may use this same number. It creates a separate barber profile.'**
  String get managerBarberPhoneSharedNote;

  /// Manual barber creation action
  ///
  /// In en, this message translates to:
  /// **'Create barber'**
  String get managerBarberCreate;

  /// Invalid normalized phone message
  ///
  /// In en, this message translates to:
  /// **'Enter a valid phone number with country code.'**
  String get managerBarberPhoneInvalid;

  /// Manual barber creation success
  ///
  /// In en, this message translates to:
  /// **'Barber created without a login account.'**
  String get managerBarberCreated;

  /// Manual barber creation generic failure
  ///
  /// In en, this message translates to:
  /// **'Could not create the barber. Please try again.'**
  String get managerBarberCreateError;

  /// No description provided for @bookingSavedAddressesLabel.
  ///
  /// In en, this message translates to:
  /// **'Saved addresses'**
  String get bookingSavedAddressesLabel;

  /// No description provided for @bookingFirstAvailable.
  ///
  /// In en, this message translates to:
  /// **'First available'**
  String get bookingFirstAvailable;

  /// No description provided for @bookingPreferredBarber.
  ///
  /// In en, this message translates to:
  /// **'Preferred barber'**
  String get bookingPreferredBarber;

  /// No description provided for @bookingSummaryTitle.
  ///
  /// In en, this message translates to:
  /// **'Booking summary'**
  String get bookingSummaryTitle;

  /// No description provided for @bookingTotalPrice.
  ///
  /// In en, this message translates to:
  /// **'Total price: {price}'**
  String bookingTotalPrice(Object price);

  /// No description provided for @bookingTotalDuration.
  ///
  /// In en, this message translates to:
  /// **'Estimated duration: {minutes} min'**
  String bookingTotalDuration(int minutes);

  /// No description provided for @bookingPaymentTitle.
  ///
  /// In en, this message translates to:
  /// **'Payment'**
  String get bookingPaymentTitle;

  /// No description provided for @bookingPayAtSalon.
  ///
  /// In en, this message translates to:
  /// **'Pay at salon'**
  String get bookingPayAtSalon;

  /// No description provided for @bookingPayAtSalonOnly.
  ///
  /// In en, this message translates to:
  /// **'Payment is due in person when you arrive at the salon.'**
  String get bookingPayAtSalonOnly;

  /// No description provided for @bookingStatusInProgress.
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get bookingStatusInProgress;

  /// No description provided for @bookingTrackerTitle.
  ///
  /// In en, this message translates to:
  /// **'Appointment status'**
  String get bookingTrackerTitle;

  /// No description provided for @bookingTrackerConfirmed.
  ///
  /// In en, this message translates to:
  /// **'Your appointment is confirmed.'**
  String get bookingTrackerConfirmed;

  /// No description provided for @bookingTrackerInProgress.
  ///
  /// In en, this message translates to:
  /// **'Your appointment is in progress.'**
  String get bookingTrackerInProgress;

  /// No description provided for @bookingTrackerCompleted.
  ///
  /// In en, this message translates to:
  /// **'Your appointment is completed.'**
  String get bookingTrackerCompleted;

  /// No description provided for @bookingTrackerPending.
  ///
  /// In en, this message translates to:
  /// **'Your appointment is awaiting confirmation.'**
  String get bookingTrackerPending;

  /// No description provided for @bookingTrackerNoShow.
  ///
  /// In en, this message translates to:
  /// **'This appointment was marked as a no-show.'**
  String get bookingTrackerNoShow;

  /// No description provided for @bookingTrackerCancelled.
  ///
  /// In en, this message translates to:
  /// **'This appointment was cancelled.'**
  String get bookingTrackerCancelled;

  /// No description provided for @bookingTrackAction.
  ///
  /// In en, this message translates to:
  /// **'Track appointment'**
  String get bookingTrackAction;

  /// No description provided for @profileEditAction.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profileEditAction;

  /// No description provided for @profileSavedAddressesAction.
  ///
  /// In en, this message translates to:
  /// **'Saved addresses'**
  String get profileSavedAddressesAction;

  /// No description provided for @profileEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profileEditTitle;

  /// No description provided for @profileSaveAction.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get profileSaveAction;

  /// No description provided for @profileFullNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get profileFullNameLabel;

  /// No description provided for @profilePhoneNumberLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get profilePhoneNumberLabel;

  /// No description provided for @profileEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get profileEmailLabel;

  /// Profile button that opens the language, currency and display settings screen
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get profileSettingsAction;

  /// Title of the client settings screen
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get profileSettingsTitle;

  /// Label for the preferred language selector on the settings screen
  ///
  /// In en, this message translates to:
  /// **'Preferred language'**
  String get profileSettingsLanguageLabel;

  /// English option in the preferred language selector
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get profileSettingsLanguageEnglish;

  /// Arabic option in the preferred language selector
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get profileSettingsLanguageArabic;

  /// Label for the display currency selector on the settings screen
  ///
  /// In en, this message translates to:
  /// **'Display currency'**
  String get profileSettingsCurrencyLabel;

  /// Label for the price display mode selector on the settings screen
  ///
  /// In en, this message translates to:
  /// **'Price display'**
  String get profileSettingsPriceDisplayModeLabel;

  /// Tax inclusive option in the price display mode selector
  ///
  /// In en, this message translates to:
  /// **'Tax inclusive'**
  String get profileSettingsPriceDisplayModeTaxInclusive;

  /// Tax exclusive option in the price display mode selector
  ///
  /// In en, this message translates to:
  /// **'Tax exclusive'**
  String get profileSettingsPriceDisplayModeTaxExclusive;

  /// Confirmation message shown after settings are saved
  ///
  /// In en, this message translates to:
  /// **'Settings saved'**
  String get profileSettingsSaved;

  /// No description provided for @savedAddressesTitle.
  ///
  /// In en, this message translates to:
  /// **'Saved addresses'**
  String get savedAddressesTitle;

  /// No description provided for @savedAddressAddTitle.
  ///
  /// In en, this message translates to:
  /// **'Add address'**
  String get savedAddressAddTitle;

  /// No description provided for @savedAddressEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit address'**
  String get savedAddressEditTitle;

  /// No description provided for @savedAddressStreetLabel.
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get savedAddressStreetLabel;

  /// No description provided for @savedAddressBuildingLabel.
  ///
  /// In en, this message translates to:
  /// **'Building'**
  String get savedAddressBuildingLabel;

  /// No description provided for @savedAddressUnitLabel.
  ///
  /// In en, this message translates to:
  /// **'Unit'**
  String get savedAddressUnitLabel;

  /// No description provided for @savedAddressLatitudeLabel.
  ///
  /// In en, this message translates to:
  /// **'Latitude'**
  String get savedAddressLatitudeLabel;

  /// No description provided for @savedAddressLongitudeLabel.
  ///
  /// In en, this message translates to:
  /// **'Longitude'**
  String get savedAddressLongitudeLabel;

  /// No description provided for @businessBranchOperationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Branch operations'**
  String get businessBranchOperationsTitle;

  /// Localized date and time shown for a business appointment
  ///
  /// In en, this message translates to:
  /// **'{date} · {time}'**
  String businessAppointmentDateTime(String date, String time);

  /// Pending booking status
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get bookingStatusPending;

  /// No-show booking status
  ///
  /// In en, this message translates to:
  /// **'No-show'**
  String get bookingStatusNoShow;

  /// Fallback booking status label
  ///
  /// In en, this message translates to:
  /// **'Unknown status'**
  String get bookingStatusUnknown;

  /// Staff account logout action
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get staffLogOut;

  /// Business app login title
  ///
  /// In en, this message translates to:
  /// **'Sign in to your branch'**
  String get businessLoginTitle;

  /// Business app login subtitle
  ///
  /// In en, this message translates to:
  /// **'Use your branch account to manage operations.'**
  String get businessLoginSubtitle;

  /// Stylist app login title
  ///
  /// In en, this message translates to:
  /// **'Sign in to your stylist account'**
  String get stylistLoginTitle;

  /// Stylist app login subtitle
  ///
  /// In en, this message translates to:
  /// **'Manage your appointments and work status.'**
  String get stylistLoginSubtitle;

  /// Link from the stylist login to self sign-up
  ///
  /// In en, this message translates to:
  /// **'New to Dorak? Create a stylist account'**
  String get stylistSignUpLink;

  /// Stylist sign-up title
  ///
  /// In en, this message translates to:
  /// **'Join Dorak as a stylist'**
  String get stylistSignUpTitle;

  /// Stylist sign-up subtitle
  ///
  /// In en, this message translates to:
  /// **'Create your account. An administrator reviews new stylists before they can take bookings.'**
  String get stylistSignUpSubtitle;

  /// Switch: the stylist is a freelancer
  ///
  /// In en, this message translates to:
  /// **'I work independently (freelancer)'**
  String get stylistSignUpFreelancerLabel;

  /// Error when the sign-up email is already registered
  ///
  /// In en, this message translates to:
  /// **'An account with this email already exists.'**
  String get stylistSignUpEmailTaken;

  /// Label of the email code field in stylist sign-up
  ///
  /// In en, this message translates to:
  /// **'Verification code'**
  String get stylistVerifyCodeLabel;

  /// Shown after the email code is resent
  ///
  /// In en, this message translates to:
  /// **'A new code was sent.'**
  String get stylistVerifyCodeResent;

  /// Title after stylist sign-up
  ///
  /// In en, this message translates to:
  /// **'Awaiting approval'**
  String get stylistPendingTitle;

  /// Message after stylist sign-up
  ///
  /// In en, this message translates to:
  /// **'Your account was created. An administrator will review and activate it; you can sign in once it is approved.'**
  String get stylistPendingMessage;

  /// Button returning to stylist login
  ///
  /// In en, this message translates to:
  /// **'Back to sign in'**
  String get stylistPendingBackToLogin;

  /// Available chair status
  ///
  /// In en, this message translates to:
  /// **'Available'**
  String get chairStatusAvailable;

  /// Occupied chair status
  ///
  /// In en, this message translates to:
  /// **'Occupied'**
  String get chairStatusOccupied;

  /// Chair maintenance status
  ///
  /// In en, this message translates to:
  /// **'Under maintenance'**
  String get chairStatusMaintenance;

  /// Title of the dialog shown when a chair cannot enter maintenance because of upcoming bookings
  ///
  /// In en, this message translates to:
  /// **'Chair has upcoming bookings'**
  String get chairMaintenanceConflictTitle;

  /// No description provided for @chairMaintenanceConflictBody.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 upcoming booking uses this chair. Setting maintenance will cancel it and notify the client.} other{{count} upcoming bookings use this chair. Setting maintenance will cancel them and notify each client.}}'**
  String chairMaintenanceConflictBody(int count);

  /// No description provided for @chairMaintenanceConflictConfirm.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{Set maintenance and cancel 1 booking} other{Set maintenance and cancel {count} bookings}}'**
  String chairMaintenanceConflictConfirm(int count);

  /// Dismiss the chair maintenance conflict dialog
  ///
  /// In en, this message translates to:
  /// **'Keep chair available'**
  String get chairMaintenanceConflictKeep;

  /// No description provided for @businessRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get businessRetry;

  /// No description provided for @businessDashboardTitle.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get businessDashboardTitle;

  /// No description provided for @businessTodayRevenue.
  ///
  /// In en, this message translates to:
  /// **'Today revenue: {value}'**
  String businessTodayRevenue(Object value);

  /// No description provided for @businessMonthlyRevenue.
  ///
  /// In en, this message translates to:
  /// **'Monthly revenue: {value}'**
  String businessMonthlyRevenue(Object value);

  /// No description provided for @businessTodayBookings.
  ///
  /// In en, this message translates to:
  /// **'Today bookings: {value}'**
  String businessTodayBookings(int value);

  /// No description provided for @businessActiveChairs.
  ///
  /// In en, this message translates to:
  /// **'Active chairs: {active}/{total}'**
  String businessActiveChairs(int active, int total);

  /// No description provided for @businessChairStatus.
  ///
  /// In en, this message translates to:
  /// **'Chair status: {value}'**
  String businessChairStatus(Object value);

  /// No description provided for @businessBranchHint.
  ///
  /// In en, this message translates to:
  /// **'Branch'**
  String get businessBranchHint;

  /// No description provided for @businessAppointmentsTitle.
  ///
  /// In en, this message translates to:
  /// **'Appointments'**
  String get businessAppointmentsTitle;

  /// No description provided for @businessConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get businessConfirm;

  /// No description provided for @businessStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get businessStart;

  /// No description provided for @businessComplete.
  ///
  /// In en, this message translates to:
  /// **'Complete'**
  String get businessComplete;

  /// No description provided for @businessNoShow.
  ///
  /// In en, this message translates to:
  /// **'No-show'**
  String get businessNoShow;

  /// No description provided for @businessCancelBooking.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get businessCancelBooking;

  /// No description provided for @businessChairsTitle.
  ///
  /// In en, this message translates to:
  /// **'Chairs'**
  String get businessChairsTitle;

  /// No description provided for @businessUnassigned.
  ///
  /// In en, this message translates to:
  /// **'Unassigned'**
  String get businessUnassigned;

  /// No description provided for @stylistTodayTitle.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get stylistTodayTitle;

  /// Localized date and time shown for a stylist appointment
  ///
  /// In en, this message translates to:
  /// **'{date} · {time}'**
  String stylistAppointmentDateTime(String date, String time);

  /// No description provided for @stylistWorkstationOnline.
  ///
  /// In en, this message translates to:
  /// **'Workstation online'**
  String get stylistWorkstationOnline;

  /// No description provided for @stylistUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not update. Pull to retry.'**
  String get stylistUpdateFailed;

  /// No description provided for @stylistTodayAppointments.
  ///
  /// In en, this message translates to:
  /// **'Today\'s appointments'**
  String get stylistTodayAppointments;

  /// No description provided for @stylistAcceptBooking.
  ///
  /// In en, this message translates to:
  /// **'Accept Booking'**
  String get stylistAcceptBooking;

  /// No description provided for @stylistStartSession.
  ///
  /// In en, this message translates to:
  /// **'Start Session'**
  String get stylistStartSession;

  /// No description provided for @stylistCompleteSession.
  ///
  /// In en, this message translates to:
  /// **'Complete Session'**
  String get stylistCompleteSession;

  /// No description provided for @stylistMarkNoShow.
  ///
  /// In en, this message translates to:
  /// **'Mark No-Show'**
  String get stylistMarkNoShow;

  /// App bar title of the notification inbox
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationsTitle;

  /// Empty-state title of the notification inbox
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get notificationsEmptyTitle;

  /// Empty-state message of the notification inbox
  ///
  /// In en, this message translates to:
  /// **'Booking updates, invitations and review requests will appear here.'**
  String get notificationsEmptyMessage;

  /// Inbox action that marks every notification read
  ///
  /// In en, this message translates to:
  /// **'Mark all as read'**
  String get notificationsMarkAllRead;

  /// Screen-reader label for an unread notification
  ///
  /// In en, this message translates to:
  /// **'Unread'**
  String get notificationsUnreadLabel;

  /// Profile button that opens the notification inbox
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get profileNotificationsAction;

  /// Title of the phone verification screen
  ///
  /// In en, this message translates to:
  /// **'Verify your phone'**
  String get phoneVerifyTitle;

  /// Subtitle of the phone verification screen
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-digit code we sent to {phone}'**
  String phoneVerifySubtitle(String phone);

  /// Label of the phone code field
  ///
  /// In en, this message translates to:
  /// **'Verification code'**
  String get phoneVerifyCodeLabel;

  /// Button that submits the phone code
  ///
  /// In en, this message translates to:
  /// **'Verify phone'**
  String get phoneVerifyButton;

  /// Button that requests a new phone code
  ///
  /// In en, this message translates to:
  /// **'Resend code'**
  String get phoneVerifyResend;

  /// Button that leaves phone verification without verifying
  ///
  /// In en, this message translates to:
  /// **'Not now'**
  String get phoneVerifySkip;

  /// Validation message for an incomplete phone code
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-digit code.'**
  String get phoneVerifyIncomplete;

  /// Error when the phone code is rejected
  ///
  /// In en, this message translates to:
  /// **'That code is invalid or has expired.'**
  String get phoneVerifyInvalidCode;

  /// Error when the phone number is rejected
  ///
  /// In en, this message translates to:
  /// **'This phone number can\'t be verified. Check it or use another number.'**
  String get phoneVerifyPhoneRejected;

  /// Error when phone code requests are rate limited
  ///
  /// In en, this message translates to:
  /// **'Too many attempts. Please wait a minute and try again.'**
  String get phoneVerifyThrottled;

  /// Badge shown next to a verified phone number
  ///
  /// In en, this message translates to:
  /// **'Verified'**
  String get profilePhoneVerifiedLabel;

  /// Hint under the profile phone field
  ///
  /// In en, this message translates to:
  /// **'Changing your phone sends a verification code'**
  String get profilePhoneChangeHint;

  /// Branch detail line with today's opening hours
  ///
  /// In en, this message translates to:
  /// **'Today {opens}–{closes}'**
  String branchTodayHours(String opens, String closes);

  /// Branch detail line when the branch is closed today
  ///
  /// In en, this message translates to:
  /// **'Closed today'**
  String get branchClosedToday;

  /// Accessibility label for the branch address line
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get branchAddressLabel;

  /// No description provided for @stylistMenuSchedule.
  ///
  /// In en, this message translates to:
  /// **'Schedule'**
  String get stylistMenuSchedule;

  /// No description provided for @stylistMenuPortfolio.
  ///
  /// In en, this message translates to:
  /// **'Portfolio'**
  String get stylistMenuPortfolio;

  /// No description provided for @stylistMenuProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get stylistMenuProfile;

  /// No description provided for @stylistMenuAffiliations.
  ///
  /// In en, this message translates to:
  /// **'Affiliations'**
  String get stylistMenuAffiliations;

  /// No description provided for @stylistMenuJobs.
  ///
  /// In en, this message translates to:
  /// **'Jobs'**
  String get stylistMenuJobs;

  /// No description provided for @stylistCancelBooking.
  ///
  /// In en, this message translates to:
  /// **'Cancel booking'**
  String get stylistCancelBooking;

  /// No description provided for @stylistCancelReasonTitle.
  ///
  /// In en, this message translates to:
  /// **'Why are you cancelling?'**
  String get stylistCancelReasonTitle;

  /// No description provided for @stylistCancelReasonLabel.
  ///
  /// In en, this message translates to:
  /// **'Reason'**
  String get stylistCancelReasonLabel;

  /// No description provided for @stylistCancelReasonRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter a reason'**
  String get stylistCancelReasonRequired;

  /// No description provided for @stylistCancelKeep.
  ///
  /// In en, this message translates to:
  /// **'Keep booking'**
  String get stylistCancelKeep;

  /// No description provided for @stylistSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get stylistSave;

  /// No description provided for @stylistSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get stylistSaved;

  /// No description provided for @stylistLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load. Pull to retry.'**
  String get stylistLoadFailed;

  /// No description provided for @stylistScheduleTitle.
  ///
  /// In en, this message translates to:
  /// **'Weekly hours'**
  String get stylistScheduleTitle;

  /// No description provided for @stylistScheduleStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get stylistScheduleStart;

  /// No description provided for @stylistScheduleEnd.
  ///
  /// In en, this message translates to:
  /// **'End'**
  String get stylistScheduleEnd;

  /// No description provided for @stylistScheduleInvalidRange.
  ///
  /// In en, this message translates to:
  /// **'End time must be after start time'**
  String get stylistScheduleInvalidRange;

  /// No description provided for @stylistScheduleEmpty.
  ///
  /// In en, this message translates to:
  /// **'Turn on at least one working day'**
  String get stylistScheduleEmpty;

  /// No description provided for @stylistWeekday0.
  ///
  /// In en, this message translates to:
  /// **'Sunday'**
  String get stylistWeekday0;

  /// No description provided for @stylistWeekday1.
  ///
  /// In en, this message translates to:
  /// **'Monday'**
  String get stylistWeekday1;

  /// No description provided for @stylistWeekday2.
  ///
  /// In en, this message translates to:
  /// **'Tuesday'**
  String get stylistWeekday2;

  /// No description provided for @stylistWeekday3.
  ///
  /// In en, this message translates to:
  /// **'Wednesday'**
  String get stylistWeekday3;

  /// No description provided for @stylistWeekday4.
  ///
  /// In en, this message translates to:
  /// **'Thursday'**
  String get stylistWeekday4;

  /// No description provided for @stylistWeekday5.
  ///
  /// In en, this message translates to:
  /// **'Friday'**
  String get stylistWeekday5;

  /// No description provided for @stylistWeekday6.
  ///
  /// In en, this message translates to:
  /// **'Saturday'**
  String get stylistWeekday6;

  /// No description provided for @stylistPortfolioTitle.
  ///
  /// In en, this message translates to:
  /// **'Portfolio'**
  String get stylistPortfolioTitle;

  /// No description provided for @stylistPortfolioEmpty.
  ///
  /// In en, this message translates to:
  /// **'No photos yet. Add your best work.'**
  String get stylistPortfolioEmpty;

  /// No description provided for @stylistPortfolioAdd.
  ///
  /// In en, this message translates to:
  /// **'Add photo'**
  String get stylistPortfolioAdd;

  /// No description provided for @stylistPortfolioDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete photo'**
  String get stylistPortfolioDelete;

  /// No description provided for @stylistProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get stylistProfileTitle;

  /// No description provided for @stylistProfileBioEnglish.
  ///
  /// In en, this message translates to:
  /// **'Bio (English)'**
  String get stylistProfileBioEnglish;

  /// No description provided for @stylistProfileBioArabic.
  ///
  /// In en, this message translates to:
  /// **'Bio (Arabic)'**
  String get stylistProfileBioArabic;

  /// No description provided for @stylistTravelRadiusLabel.
  ///
  /// In en, this message translates to:
  /// **'Travel radius'**
  String get stylistTravelRadiusLabel;

  /// Travel radius in kilometers
  ///
  /// In en, this message translates to:
  /// **'{kilometers} km'**
  String stylistTravelRadiusValue(String kilometers);

  /// No description provided for @stylistAffiliationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Affiliations'**
  String get stylistAffiliationsTitle;

  /// No description provided for @stylistAffiliationsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No affiliations yet.'**
  String get stylistAffiliationsEmpty;

  /// No description provided for @stylistAffiliationAccept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get stylistAffiliationAccept;

  /// No description provided for @stylistAffiliationReject.
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get stylistAffiliationReject;

  /// No description provided for @stylistAffiliationStatusPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get stylistAffiliationStatusPending;

  /// No description provided for @stylistAffiliationStatusActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get stylistAffiliationStatusActive;

  /// No description provided for @stylistAffiliationStatusRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get stylistAffiliationStatusRejected;

  /// No description provided for @stylistAffiliationStatusTerminated.
  ///
  /// In en, this message translates to:
  /// **'Terminated'**
  String get stylistAffiliationStatusTerminated;

  /// No description provided for @stylistJobsTitle.
  ///
  /// In en, this message translates to:
  /// **'Jobs'**
  String get stylistJobsTitle;

  /// No description provided for @stylistJobsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No open jobs right now.'**
  String get stylistJobsEmpty;

  /// No description provided for @stylistJobApply.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get stylistJobApply;

  /// No description provided for @stylistJobApplied.
  ///
  /// In en, this message translates to:
  /// **'Application sent'**
  String get stylistJobApplied;

  /// No description provided for @stylistJobApplyRejected.
  ///
  /// In en, this message translates to:
  /// **'This job is closed or you already applied.'**
  String get stylistJobApplyRejected;

  /// No description provided for @stylistMyApplications.
  ///
  /// In en, this message translates to:
  /// **'My applications'**
  String get stylistMyApplications;

  /// No description provided for @stylistApplicationsEmpty.
  ///
  /// In en, this message translates to:
  /// **'You have not applied to any job yet.'**
  String get stylistApplicationsEmpty;

  /// No description provided for @stylistApplicationStatusSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get stylistApplicationStatusSubmitted;

  /// No description provided for @stylistApplicationStatusSeen.
  ///
  /// In en, this message translates to:
  /// **'Seen'**
  String get stylistApplicationStatusSeen;

  /// No description provided for @stylistApplicationStatusAccepted.
  ///
  /// In en, this message translates to:
  /// **'Accepted'**
  String get stylistApplicationStatusAccepted;

  /// No description provided for @stylistApplicationStatusRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get stylistApplicationStatusRejected;

  /// No description provided for @businessMenuJobs.
  ///
  /// In en, this message translates to:
  /// **'Job postings'**
  String get businessMenuJobs;

  /// No description provided for @businessMenuFloorPlan.
  ///
  /// In en, this message translates to:
  /// **'Floor plan'**
  String get businessMenuFloorPlan;

  /// No description provided for @businessMenuAffiliations.
  ///
  /// In en, this message translates to:
  /// **'Affiliations'**
  String get businessMenuAffiliations;

  /// No description provided for @businessMenuProfile.
  ///
  /// In en, this message translates to:
  /// **'Branch profile'**
  String get businessMenuProfile;

  /// No description provided for @businessMenuReviews.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get businessMenuReviews;

  /// No description provided for @businessSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get businessSave;

  /// No description provided for @businessSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get businessSaved;

  /// No description provided for @businessLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load. Pull to retry.'**
  String get businessLoadFailed;

  /// No description provided for @businessUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not save. Please try again.'**
  String get businessUpdateFailed;

  /// No description provided for @businessFeatureNotEnabled.
  ///
  /// In en, this message translates to:
  /// **'This feature is not part of your current plan. Upgrade to use it.'**
  String get businessFeatureNotEnabled;

  /// No description provided for @businessJobsTitle.
  ///
  /// In en, this message translates to:
  /// **'Job postings'**
  String get businessJobsTitle;

  /// No description provided for @businessJobsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No job postings yet.'**
  String get businessJobsEmpty;

  /// No description provided for @businessJobAdd.
  ///
  /// In en, this message translates to:
  /// **'Add job posting'**
  String get businessJobAdd;

  /// No description provided for @businessJobNewTitle.
  ///
  /// In en, this message translates to:
  /// **'New job posting'**
  String get businessJobNewTitle;

  /// No description provided for @businessJobEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit job posting'**
  String get businessJobEditTitle;

  /// No description provided for @businessJobTitleEnglish.
  ///
  /// In en, this message translates to:
  /// **'Title (English)'**
  String get businessJobTitleEnglish;

  /// No description provided for @businessJobTitleArabic.
  ///
  /// In en, this message translates to:
  /// **'Title (Arabic)'**
  String get businessJobTitleArabic;

  /// No description provided for @businessJobDescriptionEnglish.
  ///
  /// In en, this message translates to:
  /// **'Description (English)'**
  String get businessJobDescriptionEnglish;

  /// No description provided for @businessJobDescriptionArabic.
  ///
  /// In en, this message translates to:
  /// **'Description (Arabic)'**
  String get businessJobDescriptionArabic;

  /// No description provided for @businessJobLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get businessJobLocation;

  /// No description provided for @businessJobType.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get businessJobType;

  /// No description provided for @businessJobFieldRequired.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get businessJobFieldRequired;

  /// No description provided for @businessJobDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get businessJobDelete;

  /// No description provided for @businessJobApplicants.
  ///
  /// In en, this message translates to:
  /// **'Applicants'**
  String get businessJobApplicants;

  /// No description provided for @businessApplicantsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No applications yet.'**
  String get businessApplicantsEmpty;

  /// No description provided for @businessApplicantAccept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get businessApplicantAccept;

  /// No description provided for @businessApplicantReject.
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get businessApplicantReject;

  /// No description provided for @businessApplicationStatusSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get businessApplicationStatusSubmitted;

  /// No description provided for @businessApplicationStatusSeen.
  ///
  /// In en, this message translates to:
  /// **'Seen'**
  String get businessApplicationStatusSeen;

  /// No description provided for @businessApplicationStatusAccepted.
  ///
  /// In en, this message translates to:
  /// **'Accepted'**
  String get businessApplicationStatusAccepted;

  /// No description provided for @businessApplicationStatusRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get businessApplicationStatusRejected;

  /// No description provided for @businessFloorPlanTitle.
  ///
  /// In en, this message translates to:
  /// **'Floor plan'**
  String get businessFloorPlanTitle;

  /// No description provided for @businessFloorPlanPresetStandard.
  ///
  /// In en, this message translates to:
  /// **'Standard'**
  String get businessFloorPlanPresetStandard;

  /// No description provided for @businessFloorPlanPresetCompact.
  ///
  /// In en, this message translates to:
  /// **'Compact'**
  String get businessFloorPlanPresetCompact;

  /// No description provided for @businessFloorPlanPresetUnisexZoned.
  ///
  /// In en, this message translates to:
  /// **'Unisex zoned'**
  String get businessFloorPlanPresetUnisexZoned;

  /// No description provided for @businessAffiliationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Affiliations'**
  String get businessAffiliationsTitle;

  /// No description provided for @businessAffiliationsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No affiliation requests.'**
  String get businessAffiliationsEmpty;

  /// No description provided for @businessAffiliationsPending.
  ///
  /// In en, this message translates to:
  /// **'Pending requests'**
  String get businessAffiliationsPending;

  /// No description provided for @businessAffiliationsOthers.
  ///
  /// In en, this message translates to:
  /// **'Other affiliations'**
  String get businessAffiliationsOthers;

  /// No description provided for @businessAffiliationAccept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get businessAffiliationAccept;

  /// No description provided for @businessAffiliationReject.
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get businessAffiliationReject;

  /// No description provided for @businessAffiliationStatusPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get businessAffiliationStatusPending;

  /// No description provided for @businessAffiliationStatusActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get businessAffiliationStatusActive;

  /// No description provided for @businessAffiliationStatusRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get businessAffiliationStatusRejected;

  /// No description provided for @businessAffiliationStatusTerminated.
  ///
  /// In en, this message translates to:
  /// **'Terminated'**
  String get businessAffiliationStatusTerminated;

  /// No description provided for @businessProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'Branch profile'**
  String get businessProfileTitle;

  /// No description provided for @businessProfileDescriptionEnglish.
  ///
  /// In en, this message translates to:
  /// **'Description (English)'**
  String get businessProfileDescriptionEnglish;

  /// No description provided for @businessProfileDescriptionArabic.
  ///
  /// In en, this message translates to:
  /// **'Description (Arabic)'**
  String get businessProfileDescriptionArabic;

  /// No description provided for @businessProfileAddressEnglish.
  ///
  /// In en, this message translates to:
  /// **'Address (English)'**
  String get businessProfileAddressEnglish;

  /// No description provided for @businessProfileAddressArabic.
  ///
  /// In en, this message translates to:
  /// **'Address (Arabic)'**
  String get businessProfileAddressArabic;

  /// No description provided for @businessProfileTags.
  ///
  /// In en, this message translates to:
  /// **'Tags (comma separated)'**
  String get businessProfileTags;

  /// No description provided for @businessReviewsTitle.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get businessReviewsTitle;

  /// No description provided for @businessReviewsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No reviews yet.'**
  String get businessReviewsEmpty;

  /// Review rating out of five
  ///
  /// In en, this message translates to:
  /// **'{rating} / 5'**
  String businessReviewRating(int rating);

  /// No description provided for @reviewDisputeAction.
  ///
  /// In en, this message translates to:
  /// **'Dispute'**
  String get reviewDisputeAction;

  /// No description provided for @reviewDisputeTitle.
  ///
  /// In en, this message translates to:
  /// **'Dispute this review'**
  String get reviewDisputeTitle;

  /// No description provided for @reviewDisputeReasonLabel.
  ///
  /// In en, this message translates to:
  /// **'Why is this review wrong?'**
  String get reviewDisputeReasonLabel;

  /// Dispute reason validation
  ///
  /// In en, this message translates to:
  /// **'Enter at least {min} characters'**
  String reviewDisputeReasonTooShort(int min);

  /// No description provided for @reviewDisputeCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get reviewDisputeCancel;

  /// No description provided for @reviewDisputeSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit dispute'**
  String get reviewDisputeSubmit;

  /// No description provided for @reviewDisputeUnderReview.
  ///
  /// In en, this message translates to:
  /// **'Under admin review'**
  String get reviewDisputeUnderReview;

  /// No description provided for @reviewDisputeSent.
  ///
  /// In en, this message translates to:
  /// **'Dispute sent. An admin will review it.'**
  String get reviewDisputeSent;

  /// No description provided for @stylistMenuReviews.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get stylistMenuReviews;

  /// No description provided for @stylistReviewsTitle.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get stylistReviewsTitle;

  /// No description provided for @stylistReviewsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No reviews yet.'**
  String get stylistReviewsEmpty;

  /// Review rating out of five
  ///
  /// In en, this message translates to:
  /// **'{rating} / 5'**
  String stylistReviewRating(int rating);

  /// Button on a completed appointment that opens the client's service history
  ///
  /// In en, this message translates to:
  /// **'Visit history'**
  String get stylistClientHistoryAction;

  /// Title of the screen listing a client's past visits
  ///
  /// In en, this message translates to:
  /// **'Client history'**
  String get stylistClientHistoryTitle;

  /// Empty state of the client history screen
  ///
  /// In en, this message translates to:
  /// **'No visits recorded for this client yet.'**
  String get stylistClientHistoryEmpty;

  /// Visit title when the service name is unknown
  ///
  /// In en, this message translates to:
  /// **'Visit'**
  String get stylistHistoryVisitFallback;

  /// Snackbar after a history photo is uploaded
  ///
  /// In en, this message translates to:
  /// **'Photo added.'**
  String get stylistHistoryPhotoAdded;

  /// staffTabHome
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get staffTabHome;

  /// staffTabInbox
  ///
  /// In en, this message translates to:
  /// **'Inbox'**
  String get staffTabInbox;

  /// staffTabMore
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get staffTabMore;

  /// staffMoreTitle
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get staffMoreTitle;

  /// staffEarningsTitle
  ///
  /// In en, this message translates to:
  /// **'Earnings'**
  String get staffEarningsTitle;

  /// staffEarningsEmpty
  ///
  /// In en, this message translates to:
  /// **'No completed bookings in this period.'**
  String get staffEarningsEmpty;

  /// staffEarningsRangeMonth
  ///
  /// In en, this message translates to:
  /// **'This month'**
  String get staffEarningsRangeMonth;

  /// staffEarningsRangeAll
  ///
  /// In en, this message translates to:
  /// **'All time'**
  String get staffEarningsRangeAll;

  /// staffEarningsGross
  ///
  /// In en, this message translates to:
  /// **'Gross'**
  String get staffEarningsGross;

  /// staffEarningsCommission
  ///
  /// In en, this message translates to:
  /// **'Commission'**
  String get staffEarningsCommission;

  /// staffEarningsNet
  ///
  /// In en, this message translates to:
  /// **'Net'**
  String get staffEarningsNet;

  /// staffEarningsNetUnavailable
  ///
  /// In en, this message translates to:
  /// **'Not available'**
  String get staffEarningsNetUnavailable;

  /// staffEarningsBookings
  ///
  /// In en, this message translates to:
  /// **'{count} completed bookings'**
  String staffEarningsBookings(int count);

  /// staffInboxTitle
  ///
  /// In en, this message translates to:
  /// **'Inbox'**
  String get staffInboxTitle;

  /// staffServiceNameEn
  ///
  /// In en, this message translates to:
  /// **'Name (English)'**
  String get staffServiceNameEn;

  /// staffServiceNameAr
  ///
  /// In en, this message translates to:
  /// **'Name (Arabic)'**
  String get staffServiceNameAr;

  /// staffServicePrice
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get staffServicePrice;

  /// staffServiceCurrency
  ///
  /// In en, this message translates to:
  /// **'Currency code'**
  String get staffServiceCurrency;

  /// staffServiceDuration
  ///
  /// In en, this message translates to:
  /// **'Duration (minutes)'**
  String get staffServiceDuration;

  /// staffServiceAtHome
  ///
  /// In en, this message translates to:
  /// **'Offered at home'**
  String get staffServiceAtHome;

  /// staffServiceActive
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get staffServiceActive;

  /// staffServiceInactive
  ///
  /// In en, this message translates to:
  /// **'Inactive'**
  String get staffServiceInactive;

  /// staffServiceAdd
  ///
  /// In en, this message translates to:
  /// **'Add service'**
  String get staffServiceAdd;

  /// staffServiceEditTitle
  ///
  /// In en, this message translates to:
  /// **'Edit service'**
  String get staffServiceEditTitle;

  /// staffServiceNewTitle
  ///
  /// In en, this message translates to:
  /// **'New service'**
  String get staffServiceNewTitle;

  /// staffServiceSave
  ///
  /// In en, this message translates to:
  /// **'Save service'**
  String get staffServiceSave;

  /// staffServiceDelete
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get staffServiceDelete;

  /// staffServiceDeleteTitle
  ///
  /// In en, this message translates to:
  /// **'Delete this service?'**
  String get staffServiceDeleteTitle;

  /// staffServiceDeleteMessage
  ///
  /// In en, this message translates to:
  /// **'Clients will no longer be able to book it.'**
  String get staffServiceDeleteMessage;

  /// staffServiceCancel
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get staffServiceCancel;

  /// staffServiceRequired
  ///
  /// In en, this message translates to:
  /// **'This field is required.'**
  String get staffServiceRequired;

  /// staffServiceInvalidNumber
  ///
  /// In en, this message translates to:
  /// **'Enter a valid number.'**
  String get staffServiceInvalidNumber;

  /// staffServiceMeta
  ///
  /// In en, this message translates to:
  /// **'{price} {currency} · {minutes} min'**
  String staffServiceMeta(String price, String currency, int minutes);

  /// staffServiceMetaNoDuration
  ///
  /// In en, this message translates to:
  /// **'{price} {currency}'**
  String staffServiceMetaNoDuration(String price, String currency);

  /// businessTabStaff
  ///
  /// In en, this message translates to:
  /// **'Staff'**
  String get businessTabStaff;

  /// businessTabServices
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get businessTabServices;

  /// businessMenuHours
  ///
  /// In en, this message translates to:
  /// **'Working hours'**
  String get businessMenuHours;

  /// businessMenuEarnings
  ///
  /// In en, this message translates to:
  /// **'Earnings'**
  String get businessMenuEarnings;

  /// businessStaffTitle
  ///
  /// In en, this message translates to:
  /// **'Staff'**
  String get businessStaffTitle;

  /// businessStaffEmpty
  ///
  /// In en, this message translates to:
  /// **'No stylists work at this branch yet.'**
  String get businessStaffEmpty;

  /// businessStaffActivate
  ///
  /// In en, this message translates to:
  /// **'Activate'**
  String get businessStaffActivate;

  /// businessStaffDeactivate
  ///
  /// In en, this message translates to:
  /// **'Deactivate'**
  String get businessStaffDeactivate;

  /// businessStaffStatusEnabled
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get businessStaffStatusEnabled;

  /// businessStaffStatusDisabled
  ///
  /// In en, this message translates to:
  /// **'Deactivated'**
  String get businessStaffStatusDisabled;

  /// businessStaffStatusPending
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get businessStaffStatusPending;

  /// businessStaffRating
  ///
  /// In en, this message translates to:
  /// **'{rating} ({count})'**
  String businessStaffRating(String rating, int count);

  /// businessServicesTitle
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get businessServicesTitle;

  /// businessServicesEmpty
  ///
  /// In en, this message translates to:
  /// **'No services yet. The brand owner adds them.'**
  String get businessServicesEmpty;

  /// businessHoursTitle
  ///
  /// In en, this message translates to:
  /// **'Working hours'**
  String get businessHoursTitle;

  /// businessHoursClosed
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get businessHoursClosed;

  /// businessHoursOpens
  ///
  /// In en, this message translates to:
  /// **'Opens'**
  String get businessHoursOpens;

  /// businessHoursCloses
  ///
  /// In en, this message translates to:
  /// **'Closes'**
  String get businessHoursCloses;

  /// businessHoursInvalidRange
  ///
  /// In en, this message translates to:
  /// **'Closing time must be after opening time.'**
  String get businessHoursInvalidRange;

  /// stylistTabHistory
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get stylistTabHistory;

  /// stylistTabEarnings
  ///
  /// In en, this message translates to:
  /// **'Earnings'**
  String get stylistTabEarnings;

  /// stylistMenuServices
  ///
  /// In en, this message translates to:
  /// **'Services and pricing'**
  String get stylistMenuServices;

  /// stylistHistoryTitle
  ///
  /// In en, this message translates to:
  /// **'Past appointments'**
  String get stylistHistoryTitle;

  /// stylistHistoryEmpty
  ///
  /// In en, this message translates to:
  /// **'No appointments match this filter.'**
  String get stylistHistoryEmpty;

  /// stylistHistoryFilterAll
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get stylistHistoryFilterAll;

  /// stylistServicesEditorTitle
  ///
  /// In en, this message translates to:
  /// **'Services and pricing'**
  String get stylistServicesEditorTitle;

  /// stylistServicesEditorEmpty
  ///
  /// In en, this message translates to:
  /// **'You have no services yet. Add your first one.'**
  String get stylistServicesEditorEmpty;

  /// Divider between password login and social login buttons
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get socialLoginDivider;

  /// Google sign-in button
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get socialLoginGoogle;

  /// Shown when a social sign-in could not complete
  ///
  /// In en, this message translates to:
  /// **'Sign-in failed. Please try again.'**
  String get socialLoginFailed;

  /// Section title for the About and legal block in settings
  ///
  /// In en, this message translates to:
  /// **'About and legal'**
  String get aboutLegalTitle;

  /// Link to the public privacy policy page
  ///
  /// In en, this message translates to:
  /// **'Privacy policy'**
  String get legalPrivacyPolicy;

  /// Link to the public terms page
  ///
  /// In en, this message translates to:
  /// **'Terms of service'**
  String get legalTermsOfService;

  /// Link to the public about page
  ///
  /// In en, this message translates to:
  /// **'About Dorak'**
  String get legalAboutDorak;

  /// Link to the public contact page
  ///
  /// In en, this message translates to:
  /// **'Contact us'**
  String get legalContactUs;

  /// Link to the public delete-account instructions page
  ///
  /// In en, this message translates to:
  /// **'How to delete your account'**
  String get legalDeleteAccountInfo;

  /// Shows the installed app version
  ///
  /// In en, this message translates to:
  /// **'Version {version}'**
  String appVersionLabel(String version);

  /// Shown when an external link cannot be opened
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t open the link. Try again later.'**
  String get openLinkFailed;

  /// Settings entry that opens the feedback form
  ///
  /// In en, this message translates to:
  /// **'Send feedback'**
  String get feedbackEntry;

  /// Title of the feedback screen
  ///
  /// In en, this message translates to:
  /// **'Send feedback'**
  String get feedbackTitle;

  /// Label above the feedback type choices
  ///
  /// In en, this message translates to:
  /// **'What is it about?'**
  String get feedbackKindLabel;

  /// Feedback type: a suggestion
  ///
  /// In en, this message translates to:
  /// **'Suggestion'**
  String get feedbackKindSuggestion;

  /// Feedback type: a bug report
  ///
  /// In en, this message translates to:
  /// **'Bug'**
  String get feedbackKindBug;

  /// Feedback type: a support request
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get feedbackKindSupport;

  /// Label of the feedback message field
  ///
  /// In en, this message translates to:
  /// **'Your message'**
  String get feedbackMessageLabel;

  /// Hint of the feedback message field
  ///
  /// In en, this message translates to:
  /// **'Tell us what happened or what you would like'**
  String get feedbackMessageHint;

  /// Validation: the feedback message is too short
  ///
  /// In en, this message translates to:
  /// **'Write at least 5 characters.'**
  String get feedbackMessageTooShort;

  /// Label of the optional contact email for guests
  ///
  /// In en, this message translates to:
  /// **'Your email'**
  String get feedbackEmailLabel;

  /// Validation: the guest contact email is missing or invalid
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email so we can reply.'**
  String get feedbackEmailInvalid;

  /// Button that sends the feedback
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get feedbackSubmit;

  /// Shown after the feedback was sent
  ///
  /// In en, this message translates to:
  /// **'Thank you. We received your message.'**
  String get feedbackSent;

  /// Shown when sending the feedback failed
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t send your message. Check your connection and try again.'**
  String get feedbackFailed;

  /// Shown when the feedback rate limit was hit
  ///
  /// In en, this message translates to:
  /// **'You sent several messages already. Please try again later.'**
  String get feedbackRateLimited;

  /// Shown when a stylist cannot delete the account while working for a brand or branch
  ///
  /// In en, this message translates to:
  /// **'End your work with your brand or branch first, then delete your account.'**
  String get deleteAccountActiveAffiliation;

  /// No description provided for @ownerRoleBranch.
  ///
  /// In en, this message translates to:
  /// **'Branch account'**
  String get ownerRoleBranch;

  /// No description provided for @ownerRoleOwner.
  ///
  /// In en, this message translates to:
  /// **'Brand owner'**
  String get ownerRoleOwner;

  /// No description provided for @ownerRoleLabel.
  ///
  /// In en, this message translates to:
  /// **'Sign in as'**
  String get ownerRoleLabel;

  /// No description provided for @ownerRegisterLink.
  ///
  /// In en, this message translates to:
  /// **'Register as a brand owner on the website'**
  String get ownerRegisterLink;

  /// No description provided for @ownerHomeTitle.
  ///
  /// In en, this message translates to:
  /// **'My brand'**
  String get ownerHomeTitle;

  /// No description provided for @ownerBannerPending.
  ///
  /// In en, this message translates to:
  /// **'Your brand is waiting for approval. Until then you can edit your brand and add one branch; bookings and billing stay locked.'**
  String get ownerBannerPending;

  /// No description provided for @ownerBannerRejected.
  ///
  /// In en, this message translates to:
  /// **'Your brand was rejected: {reason}'**
  String ownerBannerRejected(String reason);

  /// No description provided for @ownerBannerRejectedNoReason.
  ///
  /// In en, this message translates to:
  /// **'Your brand was rejected.'**
  String get ownerBannerRejectedNoReason;

  /// No description provided for @ownerBannerSuspended.
  ///
  /// In en, this message translates to:
  /// **'Your brand is suspended. You can view everything, but nothing can be changed.'**
  String get ownerBannerSuspended;

  /// No description provided for @ownerResubmit.
  ///
  /// In en, this message translates to:
  /// **'Send for another review'**
  String get ownerResubmit;

  /// No description provided for @ownerResubmitted.
  ///
  /// In en, this message translates to:
  /// **'Sent for review.'**
  String get ownerResubmitted;

  /// No description provided for @ownerBrandActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get ownerBrandActive;

  /// No description provided for @ownerBrandPending.
  ///
  /// In en, this message translates to:
  /// **'Pending approval'**
  String get ownerBrandPending;

  /// No description provided for @ownerBrandRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get ownerBrandRejected;

  /// No description provided for @ownerBrandSuspended.
  ///
  /// In en, this message translates to:
  /// **'Suspended'**
  String get ownerBrandSuspended;

  /// No description provided for @ownerNoBrandTitle.
  ///
  /// In en, this message translates to:
  /// **'No brand on this account'**
  String get ownerNoBrandTitle;

  /// No description provided for @ownerNoBrandBody.
  ///
  /// In en, this message translates to:
  /// **'Brand owner registration happens on the website. Register there, then sign in again.'**
  String get ownerNoBrandBody;

  /// No description provided for @ownerMenuBranches.
  ///
  /// In en, this message translates to:
  /// **'Branches'**
  String get ownerMenuBranches;

  /// No description provided for @ownerMenuServices.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get ownerMenuServices;

  /// No description provided for @ownerMenuBilling.
  ///
  /// In en, this message translates to:
  /// **'Plan and payouts'**
  String get ownerMenuBilling;

  /// No description provided for @ownerBranchesTitle.
  ///
  /// In en, this message translates to:
  /// **'Branches'**
  String get ownerBranchesTitle;

  /// No description provided for @ownerBranchesEmpty.
  ///
  /// In en, this message translates to:
  /// **'No branches yet.'**
  String get ownerBranchesEmpty;

  /// No description provided for @ownerBranchAdd.
  ///
  /// In en, this message translates to:
  /// **'Add a branch'**
  String get ownerBranchAdd;

  /// No description provided for @ownerBranchEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit branch'**
  String get ownerBranchEdit;

  /// No description provided for @ownerBranchNameEn.
  ///
  /// In en, this message translates to:
  /// **'Name (English)'**
  String get ownerBranchNameEn;

  /// No description provided for @ownerBranchNameAr.
  ///
  /// In en, this message translates to:
  /// **'Name (Arabic)'**
  String get ownerBranchNameAr;

  /// No description provided for @ownerBranchEmail.
  ///
  /// In en, this message translates to:
  /// **'Branch login email'**
  String get ownerBranchEmail;

  /// No description provided for @ownerBranchPassword.
  ///
  /// In en, this message translates to:
  /// **'Branch login password'**
  String get ownerBranchPassword;

  /// No description provided for @ownerBranchPasswordKeep.
  ///
  /// In en, this message translates to:
  /// **'Leave empty to keep the current password'**
  String get ownerBranchPasswordKeep;

  /// No description provided for @ownerBranchSave.
  ///
  /// In en, this message translates to:
  /// **'Save branch'**
  String get ownerBranchSave;

  /// No description provided for @ownerBranchSaved.
  ///
  /// In en, this message translates to:
  /// **'Branch saved.'**
  String get ownerBranchSaved;

  /// No description provided for @ownerBranchOn.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get ownerBranchOn;

  /// No description provided for @ownerBranchOff.
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get ownerBranchOff;

  /// No description provided for @ownerErrorBrandNotApproved.
  ///
  /// In en, this message translates to:
  /// **'This is available after your brand is approved.'**
  String get ownerErrorBrandNotApproved;

  /// No description provided for @ownerErrorReadOnly.
  ///
  /// In en, this message translates to:
  /// **'A suspended brand cannot be changed.'**
  String get ownerErrorReadOnly;

  /// No description provided for @ownerBillingTitle.
  ///
  /// In en, this message translates to:
  /// **'Plan and payouts'**
  String get ownerBillingTitle;

  /// No description provided for @ownerSubscriptionTitle.
  ///
  /// In en, this message translates to:
  /// **'Plan'**
  String get ownerSubscriptionTitle;

  /// No description provided for @ownerNoSubscription.
  ///
  /// In en, this message translates to:
  /// **'No plan yet.'**
  String get ownerNoSubscription;

  /// No description provided for @ownerPlanLine.
  ///
  /// In en, this message translates to:
  /// **'{plan} · {status}'**
  String ownerPlanLine(String plan, String status);

  /// No description provided for @ownerPayoutsTitle.
  ///
  /// In en, this message translates to:
  /// **'Payouts'**
  String get ownerPayoutsTitle;

  /// No description provided for @ownerPayoutsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No payouts yet.'**
  String get ownerPayoutsEmpty;

  /// No description provided for @ownerPayoutLine.
  ///
  /// In en, this message translates to:
  /// **'{amount} {currency} · {status}'**
  String ownerPayoutLine(String amount, String currency, String status);

  /// No description provided for @ownerServicesTitle.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get ownerServicesTitle;

  /// No description provided for @ownerServicesEmpty.
  ///
  /// In en, this message translates to:
  /// **'No services yet.'**
  String get ownerServicesEmpty;

  /// No description provided for @ownerServiceAdd.
  ///
  /// In en, this message translates to:
  /// **'Add a service'**
  String get ownerServiceAdd;

  /// No description provided for @ownerServiceEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit service'**
  String get ownerServiceEdit;

  /// No description provided for @ownerServiceName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get ownerServiceName;

  /// No description provided for @ownerServicePrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get ownerServicePrice;

  /// No description provided for @ownerServiceCurrency.
  ///
  /// In en, this message translates to:
  /// **'Currency code'**
  String get ownerServiceCurrency;

  /// No description provided for @ownerServiceDuration.
  ///
  /// In en, this message translates to:
  /// **'Duration (minutes)'**
  String get ownerServiceDuration;

  /// No description provided for @ownerServiceSave.
  ///
  /// In en, this message translates to:
  /// **'Save service'**
  String get ownerServiceSave;

  /// No description provided for @ownerServiceSaved.
  ///
  /// In en, this message translates to:
  /// **'Service saved.'**
  String get ownerServiceSaved;

  /// No description provided for @ownerServiceDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete service'**
  String get ownerServiceDelete;

  /// No description provided for @ownerFieldInvalidNumber.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid number'**
  String get ownerFieldInvalidNumber;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
