import 'package:core/core.dart';

import 'package:client_app/src/features/auth/change_password.bloc.dart';
import 'package:client_app/src/features/auth/password_recovery.bloc.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/saved_filters.bloc.dart';
import 'package:client_app/src/features/profile/discovery_preferences.bloc.dart';
import 'package:client_app/src/features/notifications/notifications.bloc.dart';
import 'package:client_app/src/features/onboarding/onboarding_config.bloc.dart';
import 'package:client_app/src/features/profile/avatar.bloc.dart';
import 'package:client_app/src/features/profile/delete_account.bloc.dart';
import 'package:client_app/src/features/profile/face_analysis.bloc.dart';
import 'package:client_app/src/features/profile/favorites.bloc.dart';
import 'package:client_app/src/features/profile/history.bloc.dart';
import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/review/review_submit.bloc.dart';
import 'package:client_app/src/features/reviews/branch_reviews.bloc.dart';

/// Injectable feature construction seam for [AppRouter].
///
/// Keeping concrete Dio and platform implementations here lets navigation be
/// tested with deterministic feature factories.
class AppServices {
  const AppServices({
    required this.createOnboardingConfig,
    required this.createProfileCompletion,
    required this.createPhoneVerification,
    required this.createPasswordRecovery,
    required this.createDiscovery,
    required this.createFavorites,
    required this.createBranchReviews,
    required this.createSavedFilters,
    required this.createDiscoveryPreferences,
    required this.createBranchDetail,
    required this.createStylistProfile,
    required this.createBookings,
    required this.createReviewSubmit,
    required this.createBookingRepository,
    required this.createHistory,
    required this.createFaceAnalysis,
    required this.createAvatar,
    required this.createChangePassword,
    required this.createDeleteAccount,
    required this.createFeedback,
    required this.createProfileRepository,
    required this.createNotifications,
    required this.createCurrencyRepository,
  });

  factory AppServices.live({
    required ApiClient apiClient,
    required AppPreferences preferences,
    required AuthRepository authRepository,
    FeedCache? feedCache,
  }) => AppServices(
    createOnboardingConfig: () =>
        OnboardingConfigBloc(DioOnboardingConfigRepository(apiClient)),
    createProfileCompletion: () =>
        ProfileCompletionBloc(DioProfileRepository(apiClient), preferences),
    createPhoneVerification: (phone) =>
        PhoneVerificationBloc(DioProfileRepository(apiClient), phone),
    createPasswordRecovery: () => PasswordRecoveryBloc(authRepository),
    createDiscovery: (universe) => DiscoveryBloc(
      DioExploreRepository(apiClient),
      const GeolocatorLocationProvider(),
      cache: feedCache,
      catalog: DioServiceCatalogRepository(apiClient),
      profile: DioProfileRepository(apiClient),
      initialUniverse: universe,
    ),
    createFavorites: () => FavoritesBloc(DioFavoriteRepository(apiClient)),
    createBranchReviews: () =>
        BranchReviewsBloc(DioReviewRepository(apiClient)),
    createSavedFilters: () =>
        SavedFiltersCubit(DioClientInteractionRepository(apiClient)),
    createDiscoveryPreferences: () => DiscoveryPreferencesCubit(
      DioClientInteractionRepository(apiClient),
      DioBrandRepository(apiClient),
    ),
    createBranchDetail: () => BranchDetailBloc(
      DioExploreRepository(apiClient),
      DioBranchRepository(apiClient),
      DioBookingRepository(apiClient),
      const GeolocatorLocationProvider(),
      preferences,
    ),
    createStylistProfile: () => StylistProfileBloc(
      DioExploreRepository(apiClient),
      DioCurrencyRepository(apiClient),
    ),
    createBookings: () => BookingBloc(DioBookingRepository(apiClient)),
    createReviewSubmit: () => ReviewSubmitBloc(DioReviewRepository(apiClient)),
    createBookingRepository: () => DioBookingRepository(apiClient),
    createHistory: () => HistoryBloc(DioHistoryRepository(apiClient)),
    createFaceAnalysis: () => FaceAnalysisBloc(
      DioFaceProfileRepository(apiClient),
      DioServiceCatalogRepository(apiClient),
    ),
    createAvatar: () => AvatarBloc(DioProfileRepository(apiClient)),
    createChangePassword: () => ChangePasswordBloc(authRepository),
    createDeleteAccount: () => DeleteAccountBloc(authRepository),
    createFeedback: () =>
        FeedbackBloc(DioFeedbackRepository(apiClient), FeedbackApp.client),
    createProfileRepository: () => DioProfileRepository(apiClient),
    createNotifications: () =>
        NotificationsBloc(DioNotificationRepository(apiClient)),
    createCurrencyRepository: () => DioCurrencyRepository(apiClient),
  );

  final OnboardingConfigBloc Function() createOnboardingConfig;
  final ProfileCompletionBloc Function() createProfileCompletion;
  final PhoneVerificationBloc Function(String phone) createPhoneVerification;
  final PasswordRecoveryBloc Function() createPasswordRecovery;
  final DiscoveryBloc Function(String? preferredUniverse) createDiscovery;
  final FavoritesBloc Function() createFavorites;
  final BranchReviewsBloc Function() createBranchReviews;
  final SavedFiltersCubit Function() createSavedFilters;
  final DiscoveryPreferencesCubit Function() createDiscoveryPreferences;
  final BranchDetailBloc Function() createBranchDetail;
  final StylistProfileBloc Function() createStylistProfile;
  final BookingBloc Function() createBookings;
  final ReviewSubmitBloc Function() createReviewSubmit;
  final BookingRepository Function() createBookingRepository;
  final HistoryBloc Function() createHistory;
  final FaceAnalysisBloc Function() createFaceAnalysis;
  final AvatarBloc Function() createAvatar;
  final ChangePasswordBloc Function() createChangePassword;
  final DeleteAccountBloc Function() createDeleteAccount;
  final FeedbackBloc Function() createFeedback;
  final ProfileRepository Function() createProfileRepository;
  final NotificationsBloc Function() createNotifications;
  final CurrencyRepository Function() createCurrencyRepository;
}
