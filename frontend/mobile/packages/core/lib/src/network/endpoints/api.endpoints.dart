import 'package:core/src/network/endpoints/affiliation.endpoints.dart';
import 'package:core/src/network/endpoints/app.endpoints.dart';
import 'package:core/src/network/endpoints/auth.endpoints.dart';
import 'package:core/src/network/endpoints/barber_auth.endpoints.dart';
import 'package:core/src/network/endpoints/branch.endpoints.dart';
import 'package:core/src/network/endpoints/branch_auth.endpoints.dart';
import 'package:core/src/network/endpoints/booking.endpoints.dart';
import 'package:core/src/network/endpoints/client_interaction.endpoints.dart';
import 'package:core/src/network/endpoints/currency.endpoints.dart';
import 'package:core/src/network/endpoints/explore.endpoints.dart';
import 'package:core/src/network/endpoints/face_profile.endpoints.dart';
import 'package:core/src/network/endpoints/favorite.endpoints.dart';
import 'package:core/src/network/endpoints/history.endpoints.dart';
import 'package:core/src/network/endpoints/job_posting.endpoints.dart';
import 'package:core/src/network/endpoints/notification.endpoints.dart';
import 'package:core/src/network/endpoints/operations.endpoints.dart';
import 'package:core/src/network/endpoints/profile.endpoints.dart';
import 'package:core/src/network/endpoints/review.endpoints.dart';
import 'package:core/src/network/endpoints/service_catalog.endpoints.dart';

/// Centralized facade for all API endpoints.
/// Provides namespaced access: [ApiEndpoints.auth.login], [ApiEndpoints.booking.bookings], etc.
class ApiEndpoints {
  ApiEndpoints._();

  /// Barber affiliation endpoints
  static final affiliation = _AffiliationEndpoints();

  /// Application-level endpoints (health, onboarding config)
  static final app = _AppEndpoints();

  /// Client authentication endpoints
  static final auth = _AuthEndpoints();

  /// Barber/stylist authentication endpoints
  static final barberAuth = _BarberAuthEndpoints();

  /// Branch/business authentication endpoints
  static final branchAuth = _BranchAuthEndpoints();

  /// Booking endpoints
  static final booking = _BookingEndpoints();

  /// Branch endpoints
  static final branch = _BranchEndpoints();

  /// Client interaction endpoints (saved filters, discovery preferences)
  static final clientInteraction = _ClientInteractionEndpoints();

  /// Currency endpoints
  static final currency = _CurrencyEndpoints();

  /// Explore/discovery endpoints
  static final explore = _ExploreEndpoints();

  /// Face profile endpoints
  static final faceProfile = _FaceProfileEndpoints();

  /// Favorites endpoints
  static final favorite = _FavoriteEndpoints();

  /// History endpoints
  static final history = _HistoryEndpoints();

  /// Job posting endpoints
  static final jobPosting = _JobPostingEndpoints();

  /// Notification endpoints
  static final notification = _NotificationEndpoints();

  /// Operations endpoints (branch & barber operations)
  static final operations = _OperationsEndpoints();

  /// Client profile endpoints
  static final profile = _ProfileEndpoints();

  /// Review endpoints
  static final review = _ReviewEndpoints();

  /// Service catalog endpoints
  static final serviceCatalog = _ServiceCatalogEndpoints();

  /// Health check endpoint
  static const String health = AppEndpoints.health;
}

/// Private wrapper classes for namespaced access
class _AppEndpoints {
  const _AppEndpoints();
  String get onboardingConfig => AppEndpoints.onboardingConfig;
}

class _AuthEndpoints {
  const _AuthEndpoints();
  String get login => AuthEndpoints.login;
  String get register => AuthEndpoints.register;
  String get logout => AuthEndpoints.logout;
  String get refreshToken => AuthEndpoints.refreshToken;
  String get forgotPassword => AuthEndpoints.forgotPassword;
  String get verifyResetCode => AuthEndpoints.verifyResetCode;
  String get resetPassword => AuthEndpoints.resetPassword;
  String get verifyEmail => AuthEndpoints.verifyEmail;
  String get sendEmailVerification => AuthEndpoints.sendEmailVerification;
  String get changePassword => AuthEndpoints.changePassword;
  String get deleteAccount => AuthEndpoints.deleteAccount;
  String socialLogin(String provider) => AuthEndpoints.socialLogin(provider);
}

class _BarberAuthEndpoints {
  const _BarberAuthEndpoints();
  String get login => BarberAuthEndpoints.login;
  String get register => BarberAuthEndpoints.register;
  String get sendEmailVerification => BarberAuthEndpoints.sendEmailVerification;
  String get verifyEmail => BarberAuthEndpoints.verifyEmail;
}

class _BranchAuthEndpoints {
  const _BranchAuthEndpoints();
  String get login => BranchAuthEndpoints.login;
}

class _BookingEndpoints {
  const _BookingEndpoints();
  String get bookings => BookingEndpoints.bookings;
  String bookingDetail(String id) => BookingEndpoints.bookingDetail.replaceFirst('{booking}', id);
  String cancelBooking(String id) => BookingEndpoints.cancelBooking.replaceFirst('{booking}', id);
  String barberSlots(String barberId) => BookingEndpoints.barberSlots.replaceFirst('{barber}', barberId);
}

class _BranchEndpoints {
  const _BranchEndpoints();
  String floorPlan(String branchId) => BranchEndpoints.floorPlan.replaceFirst('{branch}', branchId);
  String slots(String branchId) => BranchEndpoints.slots.replaceFirst('{branch}', branchId);
  String get managedBarbers => BranchEndpoints.managedBarbers;
  String activateBarber(String barberId) => BranchEndpoints.activateBarber.replaceFirst('{barber}', barberId);
  String deactivateBarber(String barberId) => BranchEndpoints.deactivateBarber.replaceFirst('{barber}', barberId);
  String get profile => BranchEndpoints.profile;
  String chairStatus(String chairId) => BranchEndpoints.chairStatus.replaceFirst('{chair}', chairId);
}

class _ClientInteractionEndpoints {
  const _ClientInteractionEndpoints();
  String get savedFilters => ClientInteractionEndpoints.savedFilters;
  String get discoveryPreferences => ClientInteractionEndpoints.discoveryPreferences;
  String savedFilter(String id) => ClientInteractionEndpoints.savedFilter(id);
}

class _CurrencyEndpoints {
  const _CurrencyEndpoints();
  String get currencies => CurrencyEndpoints.currencies;
}

class _ExploreEndpoints {
  const _ExploreEndpoints();
  String get search => ExploreEndpoints.search;
  String get branches => ExploreEndpoints.branches;
  String get barbers => ExploreEndpoints.barbers;
  String branchDetail(String branchId) => ExploreEndpoints.branchDetail.replaceFirst('{branch}', branchId);
  String barberDetail(String barberId) => ExploreEndpoints.barberDetail.replaceFirst('{barber}', barberId);
}

class _FaceProfileEndpoints {
  const _FaceProfileEndpoints();
  String get upload => FaceProfileEndpoints.upload;
  String profile(String id) => FaceProfileEndpoints.profile(id);
  String get recommendations => FaceProfileEndpoints.recommendations;
}

class _FavoriteEndpoints {
  const _FavoriteEndpoints();
  String get favorites => FavoriteEndpoints.favorites;
  String favoriteDetail(String id) => FavoriteEndpoints.favoriteDetail.replaceFirst('{favorite}', id);
}

class _HistoryEndpoints {
  const _HistoryEndpoints();
  String get history => HistoryEndpoints.history;
  String updateEntry(String historyId) => HistoryEndpoints.updateEntry.replaceFirst('{history}', historyId);
  String rebookFromHistory(String historyId) => HistoryEndpoints.rebookFromHistory.replaceFirst('{history}', historyId);
  String attachMedia(String historyId) => HistoryEndpoints.attachMedia.replaceFirst('{history}', historyId);
}

class _JobPostingEndpoints {
  const _JobPostingEndpoints();
  String get jobs => JobPostingEndpoints.jobs;
  String get applications => JobPostingEndpoints.applications;
  String get branchJobPostings => JobPostingEndpoints.branchJobPostings;
  String get branchFloorPlan => JobPostingEndpoints.branchFloorPlan;
  String job(String id) => JobPostingEndpoints.job(id);
  String apply(String id) => JobPostingEndpoints.apply(id);
  String branchJobPosting(String id) => JobPostingEndpoints.branchJobPosting(id);
  String branchApplications(String id) => JobPostingEndpoints.branchApplications(id);
  String branchApplicationStatus(String jobId, String applicationId) => JobPostingEndpoints.branchApplicationStatus(jobId, applicationId);
}

class _AffiliationEndpoints {
  const _AffiliationEndpoints();
  String barberAffiliate(String barberId) => AffiliationEndpoints.barberAffiliate.replaceFirst('{barber}', barberId);
  String barberAffiliations(String barberId) => AffiliationEndpoints.barberAffiliations.replaceFirst('{barber}', barberId);
  String affiliationAccept(String affiliationId) => AffiliationEndpoints.affiliationAccept.replaceFirst('{affiliation}', affiliationId);
  String affiliationReject(String affiliationId) => AffiliationEndpoints.affiliationReject.replaceFirst('{affiliation}', affiliationId);
  String affiliationTerminate(String affiliationId) => AffiliationEndpoints.affiliationTerminate.replaceFirst('{affiliation}', affiliationId);
  String get branchAffiliations => AffiliationEndpoints.branchAffiliations;
  String branchAffiliationAccept(String affiliationId) => AffiliationEndpoints.branchAffiliationAccept.replaceFirst('{affiliation}', affiliationId);
  String branchAffiliationReject(String affiliationId) => AffiliationEndpoints.branchAffiliationReject.replaceFirst('{affiliation}', affiliationId);
  String branchAffiliationTerminate(String affiliationId) => AffiliationEndpoints.branchAffiliationTerminate.replaceFirst('{affiliation}', affiliationId);
}

class _NotificationEndpoints {
  const _NotificationEndpoints();
  String get notifications => NotificationEndpoints.notifications;
  String markRead(String notificationId) => NotificationEndpoints.markRead.replaceFirst('{notification}', notificationId);
  String get markAllRead => NotificationEndpoints.markAllRead;
}

class _OperationsEndpoints {
  const _OperationsEndpoints();
  String get branchDashboard => OperationsEndpoints.branchDashboard;
  String get branchBookings => OperationsEndpoints.branchBookings;
  String branchBookingStatus(String bookingId) => OperationsEndpoints.branchBookingStatus.replaceFirst('{booking}', bookingId);
  String branchBookingReview(String bookingId) => OperationsEndpoints.branchBookingReview.replaceFirst('{booking}', bookingId);
  String get branchChairs => OperationsEndpoints.branchChairs;
  String get barberTodayAppointments => OperationsEndpoints.barberTodayAppointments;
  String get barberProfile => OperationsEndpoints.barberProfile;
  String get barberWorkstationStatus => OperationsEndpoints.barberWorkstationStatus;
  String barberBookingAccept(String bookingId) => OperationsEndpoints.barberBookingAccept.replaceFirst('{booking}', bookingId);
  String barberBookingStart(String bookingId) => OperationsEndpoints.barberBookingStart.replaceFirst('{booking}', bookingId);
  String barberBookingComplete(String bookingId) => OperationsEndpoints.barberBookingComplete.replaceFirst('{booking}', bookingId);
  String barberBookingNoShow(String bookingId) => OperationsEndpoints.barberBookingNoShow.replaceFirst('{booking}', bookingId);
  String barberBookingReview(String bookingId) => OperationsEndpoints.barberBookingReview.replaceFirst('{booking}', bookingId);
  String get barberServices => OperationsEndpoints.barberServices;
  String barberService(String serviceId) => OperationsEndpoints.barberService.replaceFirst('{service}', serviceId);
}

class _ProfileEndpoints {
  const _ProfileEndpoints();
  String get show => ProfileEndpoints.show;
  String get update => ProfileEndpoints.update;
  String get phoneOtp => ProfileEndpoints.phoneOtp;
  String get phoneVerify => ProfileEndpoints.phoneVerify;
  String get avatar => ProfileEndpoints.avatar;
  String get universe => ProfileEndpoints.universe;
  String get settings => ProfileEndpoints.settings;
}

class _ReviewEndpoints {
  const _ReviewEndpoints();
  String submitReview(String bookingId) => ReviewEndpoints.submitReview.replaceFirst('{booking}', bookingId);
  String branchReviews(String branchId) => ReviewEndpoints.branchReviews.replaceFirst('{branch}', branchId);
  String barberReviews(String barberId) => ReviewEndpoints.barberReviews.replaceFirst('{barber}', barberId);
}

class _ServiceCatalogEndpoints {
  const _ServiceCatalogEndpoints();
  String get items => ServiceCatalogEndpoints.items;
}