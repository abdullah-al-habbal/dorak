import 'package:core/core.dart';

import 'package:client_app/src/features/auth/change_password.bloc.dart';
import 'package:client_app/src/features/auth/password_recovery.bloc.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/notifications/notifications.bloc.dart';
import 'package:client_app/src/features/onboarding/onboarding_config.bloc.dart';
import 'package:client_app/src/features/profile/avatar.bloc.dart';
import 'package:client_app/src/features/profile/face_analysis.bloc.dart';
import 'package:client_app/src/features/profile/favorites.bloc.dart';
import 'package:client_app/src/features/profile/history.bloc.dart';
import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/review/review_submit.bloc.dart';

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
    required this.createBranchDetail,
    required this.createStylistProfile,
    required this.createBookings,
    required this.createReviewSubmit,
    required this.createBookingRepository,
    required this.createHistory,
    required this.createFaceAnalysis,
    required this.createAvatar,
    required this.createChangePassword,
    required this.createProfileRepository,
    required this.createNotifications,
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
    createDiscovery: () => DiscoveryBloc(
      DioExploreRepository(apiClient),
      const GeolocatorLocationProvider(),
      cache: feedCache,
      catalog: DioServiceCatalogRepository(apiClient),
    ),
    createFavorites: () => FavoritesBloc(DioFavoriteRepository(apiClient)),
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
    createProfileRepository: () => DioProfileRepository(apiClient),
    createNotifications: () =>
        NotificationsBloc(DioNotificationRepository(apiClient)),
  );

  final OnboardingConfigBloc Function() createOnboardingConfig;
  final ProfileCompletionBloc Function() createProfileCompletion;
  final PhoneVerificationBloc Function(String phone) createPhoneVerification;
  final PasswordRecoveryBloc Function() createPasswordRecovery;
  final DiscoveryBloc Function() createDiscovery;
  final FavoritesBloc Function() createFavorites;
  final BranchDetailBloc Function() createBranchDetail;
  final StylistProfileBloc Function() createStylistProfile;
  final BookingBloc Function() createBookings;
  final ReviewSubmitBloc Function() createReviewSubmit;
  final BookingRepository Function() createBookingRepository;
  final HistoryBloc Function() createHistory;
  final FaceAnalysisBloc Function() createFaceAnalysis;
  final AvatarBloc Function() createAvatar;
  final ChangePasswordBloc Function() createChangePassword;
  final ProfileRepository Function() createProfileRepository;
  final NotificationsBloc Function() createNotifications;
}
