import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/navigation/app.router.dart';
import 'package:client_app/src/core/locale/locale.bloc.dart';
import 'package:client_app/src/core/session/auth_coordination.entity.dart';
import 'package:client_app/src/features/auth/change_password.bloc.dart';
import 'package:client_app/src/features/auth/password_recovery.bloc.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/notifications/notifications.bloc.dart';
import 'package:client_app/src/features/onboarding/onboarding_config.bloc.dart';
import 'package:client_app/src/features/profile/avatar.bloc.dart';
import 'package:client_app/src/features/profile/face_analysis.bloc.dart';
import 'package:client_app/src/features/profile/history.bloc.dart';
import 'package:client_app/src/features/profile/favorites.bloc.dart';
import 'package:client_app/src/features/profile/photo_picker.provider.dart';
import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/review/review_submit.bloc.dart';

// todo: read this file, and I think is better to make a fakes folder and then move each block/class into a file for better code.
Widget routerHarness(AppRouter appRouter) {
  return MaterialApp.router(
    routerConfig: appRouter.router,
    debugShowCheckedModeBanner: false,
    theme: DorakTheme.forLocale(const Locale('en'), Brightness.light),
    locale: const Locale('en'),
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
  );
}

AppRouter buildRouter({
  required SessionBloc session,
  required AuthBloc auth,
  required AppPreferences preferences,
  required ApiClient apiClient,
  PasswordRecoveryBloc? recovery,
  AuthRepository? recoveryRepository,
  BookingBloc? bookings,
  BranchDetailBloc? branchDetail,
  ChangePasswordBloc? passwordChange,
  DiscoveryBloc? discovery,
  HistoryBloc? history,
  FaceAnalysisBloc? faceAnalysis,
  AvatarBloc? avatar,
  StylistProfileBloc? stylistProfile,
  ReviewSubmitBloc? reviewSubmit,
  FavoritesBloc? favorites,
  ProfileCompletionBloc? profileCompletion,
  PhoneVerificationBloc? phoneVerification,
  NotificationsBloc? notifications,
  PhotoPicker? photoPicker,
  VoidCallback switchLocale = _noSwitchLocale,
  void Function(String barberId) onBarberSelected = _noBarberSelected,
}) {
  return AppRouter(
    session: session,
    auth: auth,
    recovery:
        recovery ??
        PasswordRecoveryBloc(recoveryRepository ?? FakeAuthRepository()),
    preferences: preferences,
    authRepository: recoveryRepository ?? FakeAuthRepository(),
    locale: LocaleBloc(),
    onboardingConfig: fakeOnboardingConfig(),
    bookings: bookings ?? fakeBookingBloc(),
    branchDetail: branchDetail ?? fakeBranchDetailBloc(),
    passwordChange:
        passwordChange ??
        ChangePasswordBloc(recoveryRepository ?? FakeAuthRepository()),
    discovery: discovery ?? fakeDiscoveryBloc(),
    history: history ?? fakeHistoryBloc(),
    favorites: favorites ?? fakeFavoritesBloc(),
    faceAnalysis: faceAnalysis ?? fakeFaceAnalysisBloc(),
    avatar: avatar ?? fakeAvatarBloc(),
    stylistProfile: stylistProfile ?? fakeStylistProfileBloc(),
    reviewSubmit: reviewSubmit ?? fakeReviewSubmitBloc(),
    profileCompletion:
        profileCompletion ??
        ProfileCompletionBloc(FakeProfileRepository(), preferences),
    phoneVerification: phoneVerification,
    notifications: notifications ?? fakeNotificationsBloc(),
    photoPicker: photoPicker ?? FakePhotoPicker(),
    switchLocale: switchLocale,
    apiClient: apiClient,
  );
}

({
  AuthBloc auth,
  SessionBloc session,
  StreamSubscription<AuthState> coordinator,
})
sessionPair(AuthRepository repository, TokenStorage storage) {
  final auth = AuthBloc(repository, storage);
  final session = SessionBloc(repository, storage, FakeProfileRepository());
  final coordinator = auth.stream.listen(
    (authState) => coordinateAuthSuccess(authState, session),
  );
  return (auth: auth, session: session, coordinator: coordinator);
}

void _noSwitchLocale() {}
void _noBarberSelected(String _) {}

ApiClient fakeApiClient() {
  return ApiClient(
    baseUrl: 'https://api.example.com',
    tokenProvider: () async => null,
    enableLogging: false,
  );
}

class InMemoryTokenStorage implements TokenStorage {
  String? token;
  int clearCount = 0;

  InMemoryTokenStorage([this.token]);

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String value) async => token = value;

  @override
  Future<void> clear() async {
    token = null;
    clearCount++;
  }
}

class InMemoryAppPreferences implements AppPreferences {
  @override
  bool dontShowOnboarding;
  @override
  bool profileCompleted;
  @override
  List<SavedAddress> savedAddresses = const [];

  InMemoryAppPreferences({
    this.dontShowOnboarding = false,
    this.profileCompleted = true,
  });

  @override
  Future<void> setDontShowOnboarding(bool value) async {
    dontShowOnboarding = value;
  }

  @override
  Future<void> setProfileCompleted(bool value) async {
    profileCompleted = value;
  }

  @override
  Future<void> saveAddress(SavedAddress address) async {
    savedAddresses = [address, ...savedAddresses];
  }

  @override
  Future<void> replaceAddress(
    SavedAddress previous,
    SavedAddress address,
  ) async {
    savedAddresses = [
      address,
      ...savedAddresses.where((item) => item.label != previous.label),
    ];
  }

  @override
  Future<void> deleteAddress(SavedAddress address) async {
    savedAddresses = savedAddresses
        .where((item) => item.label != address.label)
        .toList();
  }
}

class FakeAuthRepository implements AuthRepository {
  static final ClientDto _client = ClientDto(
    id: 'uuid-1',
    name: 'Sara',
    email: 'sara@example.com',
    phone: null,
    emailVerifiedAt: DateTime.utc(2026, 1, 1),
  );

  Object? refreshTokenError;
  Object? loginError;
  Object? registerError;
  Object? verifyEmailError;
  Object? forgotPasswordError;
  Object? resetPasswordError;
  Object? verifyResetCodeError;

  String? forgotPasswordEmail;
  int forgotPasswordCalls = 0;
  Map<String, String>? resetPasswordPayload;
  Map<String, String>? verifyResetCodePayload;

  @override
  Future<void> deleteAccount(String password) async {}

  /// Counts session re-probes. One `RestoreRequested` with a stored token calls
  /// `refreshToken` exactly once, so this is how a test observes a restore
  /// without depending on frame timing.
  int refreshTokenCalls = 0;

  /// When set, `refreshToken` blocks on it. Lets a test hold the session in
  /// `AuthStatus.unknown` / `isLoading`. Null by default, so every other test
  /// keeps resolving in a microtask.
  Completer<void>? refreshTokenGate;

  int sendVerificationCalls = 0;
  String? verifiedCode;

  @override
  Future<String> refreshToken() async {
    refreshTokenCalls++;
    final gate = refreshTokenGate;
    if (gate != null) await gate.future;
    final error = refreshTokenError;
    if (error != null) throw error;
    return 'rotated-token';
  }

  @override
  Future<AuthResponseDto> login({
    required String email,
    required String password,
  }) async {
    final error = loginError;
    if (error != null) throw error;
    return AuthResponseDto(token: 'login-token', client: _client);
  }

  @override
  Future<AuthResponseDto> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? phone,
  }) async {
    final error = registerError;
    if (error != null) throw error;
    return AuthResponseDto(token: 'register-token', client: _client);
  }

  @override
  Future<void> logout() async {}

  @override
  Future<void> sendEmailVerification() async {
    sendVerificationCalls++;
  }

  @override
  Future<void> verifyEmail(String code) async {
    verifiedCode = code;
    final error = verifyEmailError;
    if (error != null) throw error;
  }

  @override
  Future<void> forgotPassword(String email) async {
    forgotPasswordEmail = email;
    forgotPasswordCalls++;
    final error = forgotPasswordError;
    if (error != null) throw error;
  }

  @override
  Future<void> verifyResetCode({
    required String email,
    required String code,
  }) async {
    verifyResetCodePayload = {'email': email, 'code': code};
    final error = verifyResetCodeError;
    if (error != null) throw error;
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    resetPasswordPayload = {
      'email': email,
      'code': code,
      'password': password,
      'password_confirmation': passwordConfirmation,
    };
    final error = resetPasswordError;
    if (error != null) throw error;
  }

  Object? changePasswordError;
  Map<String, String>? changePasswordPayload;
  int changePasswordCalls = 0;

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String password,
    required String passwordConfirmation,
  }) async {
    changePasswordCalls++;
    changePasswordPayload = {
      'current_password': currentPassword,
      'password': password,
      'password_confirmation': passwordConfirmation,
    };
    final error = changePasswordError;
    if (error != null) throw error;
  }

  @override
  Future<void> socialLogin({
    required SocialAuthProvider provider,
    required String accessToken,
  }) async {}
}

class FakeOnboardingConfigRepository implements OnboardingConfigRepository {
  @override
  Future<OnboardingConfigDto> fetchOnboardingConfig({String? locale}) async {
    return const OnboardingConfigDto(
      heroImageUrl: '',
      season: null,
      locale: 'en',
    );
  }
}

OnboardingConfigBloc fakeOnboardingConfig() {
  return OnboardingConfigBloc(FakeOnboardingConfigRepository());
}

Position testPosition({
  double latitude = 24.7136,
  double longitude = 46.6753,
}) => Position(
  latitude: latitude,
  longitude: longitude,
  timestamp: DateTime.utc(2026, 1, 1),
  accuracy: 5,
  altitude: 0,
  altitudeAccuracy: 0,
  heading: 0,
  headingAccuracy: 0,
  speed: 0,
  speedAccuracy: 0,
);

ExploreSearchItemDto testBranchItem(BranchDto branch) => ExploreSearchItemDto(
  type: 'branch',
  distance: branch.distance,
  branch: branch,
);

ExploreSearchItemDto testBarberItem(
  BarberProfileDto barber, {
  double? distance,
}) => ExploreSearchItemDto(type: 'barber', distance: distance, barber: barber);

PaginatedData<ExploreSearchItemDto> asSearchPage(
  PaginatedData<BranchDto> page, {
  List<BarberProfileDto> barbers = const [],
}) => PaginatedData(
  data: [
    ...page.data.map(testBranchItem),
    ...barbers.map((barber) => testBarberItem(barber, distance: 1.2)),
  ],
  meta: page.meta,
);

BranchDto testBranch({int id = 1}) => BranchDto(
  id: '$id',
  name: 'Branch $id',
  email: 'branch$id@example.com',
  status: 'approved',
  latitude: 24.7136,
  longitude: 46.6753,
  brandId: '7',
  distance: 3.5,
  compatibilityScore: 0.92,
  rank: id,
);

PaginatedData<BranchDto> testBranchPage({
  List<BranchDto>? branches,
  int currentPage = 1,
  int totalPages = 1,
}) {
  final items = branches ?? [testBranch()];
  return PaginatedData(
    data: items,
    meta: PaginationMeta(
      total: items.length,
      count: items.length,
      perPage: 20,
      currentPage: currentPage,
      totalPages: totalPages,
    ),
  );
}

class FakeExploreRepository implements ExploreRepository {
  PaginatedData<BranchDto> firstPage = testBranchPage();
  PaginatedData<BranchDto>? morePage;
  List<Object?> rawItems = const [];
  Map<String, dynamic> rawMeta = const {};
  Object? error;

  int getBranchesCalls = 0;
  int getBranchesPayloadCalls = 0;
  String? lastQuery;
  final List<String?> queries = [];
  int lastPage = 1;
  String? lastUniverse;
  bool? lastAvailableNow;

  @override
  Future<PaginatedData<BranchDto>> getBranches({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? faceShapeCompatible,
    String? query,
  }) async {
    getBranchesCalls++;
    lastQuery = query;
    lastPage = page;
    lastUniverse = universe;
    lastAvailableNow = availableNow;
    final failure = error;
    if (failure != null) throw failure;
    if (page > 1 && morePage != null) return morePage!;
    return firstPage;
  }

  @override
  Future<RawPaginated<BranchDto>> getBranchesPayload({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? faceShapeCompatible,
    String? query,
  }) async {
    getBranchesPayloadCalls++;
    lastQuery = query;
    queries.add(query);
    lastUniverse = universe;
    lastAvailableNow = availableNow;
    final failure = error;
    if (failure != null) throw failure;
    return (data: firstPage, rawItems: rawItems, rawMeta: rawMeta);
  }

  int searchPayloadCalls = 0;

  @override
  Future<RawPaginated<ExploreSearchItemDto>> searchPayload({
    required double latitude,
    required double longitude,
    required double radius,
    String? universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? query,
  }) async {
    searchPayloadCalls++;
    lastQuery = query;
    queries.add(query);
    lastPage = page;
    lastUniverse = universe;
    lastAvailableNow = availableNow;
    final failure = error;
    if (failure != null) throw failure;
    final source = page > 1 && morePage != null ? morePage! : firstPage;
    return (
      data: asSearchPage(source, barbers: searchBarbers),
      rawItems: rawItems,
      rawMeta: rawMeta,
    );
  }

  List<BarberProfileDto> searchBarbers = const [];

  BranchDetailDto detail = testBranchDetail();

  BarberProfileDto barberDetail = testBarberProfile();

  @override
  Future<BranchDetailDto> getBranchDetail(String branchId) async {
    final failure = error;
    if (failure != null) throw failure;
    return detail;
  }

  @override
  Future<BarberProfileDto> getBarberDetail(String barberId) async {
    final failure = error;
    if (failure != null) throw failure;
    return barberDetail;
  }
}

BranchDetailDto testBranchDetail() => const BranchDetailDto(
  id: '1',
  name: 'Branch 1',
  email: 'branch1@example.com',
  status: 'approved',
  latitude: 24.7136,
  longitude: 46.6753,
  brandId: '7',
  chairsCount: 2,
  barbers: [BookingBarberDto(id: 'barber-1', name: 'Karim')],
  services: [BookingServiceDto(id: 'service-1', name: 'Fade', price: 80)],
);

class FakeLocationProvider implements LocationProvider {
  LocationPermissionStatus status = LocationPermissionStatus.granted;
  Position? position = testPosition();

  int ensurePermissionCalls = 0;

  @override
  Future<LocationPermissionStatus> ensurePermission() async {
    ensurePermissionCalls++;
    return status;
  }

  @override
  Future<Position?> getCurrentPosition() async => position;

  @override
  Stream<LocationPermissionStatus> permissionChanges() => Stream.value(status);
}

class FakeFeedCache implements FeedCache {
  final Map<String, FeedCacheEntry> entries = {};
  final List<String> evictedKeys = [];
  int writeCalls = 0;

  @override
  String keyFor({
    required String universe,
    required double latitude,
    required double longitude,
    required double radius,
    int perPage = 20,
  }) => 'fake:$universe:$latitude:$longitude:$radius:$perPage';

  @override
  Future<FeedCacheEntry?> read(String key) async => entries[key];

  @override
  Future<void> write(String key, FeedCacheEntry entry) async {
    entries[key] = entry;
    writeCalls++;
  }

  @override
  Future<void> evict(String key) async {
    entries.remove(key);
    evictedKeys.add(key);
  }

  @override
  Future<void> clear() async => entries.clear();
}

BookingDto testBooking({
  String id = 'booking-1',
  BookingStatus status = BookingStatus.confirmed,
  bool? cancellationEligible = true,
}) => BookingDto(
  id: id,
  timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
  endsAt: DateTime.utc(2026, 9, 10, 15),
  status: status,
  cancellationEligible: cancellationEligible,
  chair: const BookingChairDto(id: 'chair-1', label: 'Chair A'),
  barber: const BookingBarberDto(id: 'barber-1', name: 'Karim'),
  services: const [BookingServiceDto(id: 'service-1', name: 'Fade', price: 80)],
  createdAt: DateTime.utc(2026, 9, 2, 10),
);

PaginatedData<BookingDto> testBookingPage({
  List<BookingDto>? bookings,
  int currentPage = 1,
  int totalPages = 1,
}) {
  final items = bookings ?? [testBooking()];
  return PaginatedData(
    data: items,
    meta: PaginationMeta(
      total: items.length,
      count: items.length,
      perPage: 20,
      currentPage: currentPage,
      totalPages: totalPages,
    ),
  );
}

class FakeBookingRepository implements BookingRepository {
  PaginatedData<BookingDto> firstPage = testBookingPage();
  PaginatedData<BookingDto>? morePage;
  Object? error;
  Object? cancelError;

  int getBookingsCalls = 0;
  int getBookingCalls = 0;
  int cancelCalls = 0;
  String? lastStatus;
  int lastPage = 1;
  String? lastCancelledId;
  String? lastAtHomeStreet;
  String? lastAtHomeBuilding;
  String? lastAtHomeUnit;
  double? lastAtHomeLatitude;
  double? lastAtHomeLongitude;

  @override
  Future<PaginatedData<BookingDto>> getBookings({
    String? status,
    int page = 1,
    int perPage = 20,
  }) async {
    getBookingsCalls++;
    lastStatus = status;
    lastPage = page;
    final failure = error;
    if (failure != null) throw failure;
    if (page > 1 && morePage != null) return morePage!;
    return firstPage;
  }

  @override
  Future<BookingDto> getBooking(String id) async {
    getBookingCalls++;
    final failure = error;
    if (failure != null) throw failure;
    return firstPage.data.firstWhere(
      (booking) => booking.id == id,
      orElse: testBooking,
    );
  }

  @override
  Future<BookingDto> createBooking({
    String? chairId,
    String? branchId,
    String? barberId,
    required DateTime timeSlot,
    List<String>? serviceIds,
    String? atHomeStreet,
    String? atHomeBuilding,
    String? atHomeUnit,
    double? atHomeLatitude,
    double? atHomeLongitude,
  }) async {
    createCalls++;
    lastAtHomeStreet = atHomeStreet;
    lastAtHomeBuilding = atHomeBuilding;
    lastAtHomeUnit = atHomeUnit;
    lastAtHomeLatitude = atHomeLatitude;
    lastAtHomeLongitude = atHomeLongitude;
    final failure = createError;
    if (failure != null) throw failure;
    return createdBooking ?? testBooking();
  }

  BookingDto? createdBooking;
  Object? createError;
  int createCalls = 0;

  List<SlotDto> barberSlots = testSlots();
  Object? barberSlotsError;
  int getBarberSlotsCalls = 0;
  String? lastBarberSlotsId;
  double? lastBarberSlotsLatitude;
  double? lastBarberSlotsLongitude;

  @override
  Future<List<SlotDto>> getBarberSlots(
    String barberId, {
    required DateTime date,
    required List<String> serviceIds,
    double? atHomeLatitude,
    double? atHomeLongitude,
  }) async {
    getBarberSlotsCalls++;
    lastBarberSlotsId = barberId;
    lastBarberSlotsLatitude = atHomeLatitude;
    lastBarberSlotsLongitude = atHomeLongitude;
    final failure = barberSlotsError;
    if (failure != null) throw failure;
    return barberSlots;
  }

  @override
  Future<void> cancelBooking(String id) async {
    cancelCalls++;
    lastCancelledId = id;
    final failure = cancelError;
    if (failure != null) throw failure;
  }
}

BookingBloc fakeBookingBloc({FakeBookingRepository? repository}) {
  return BookingBloc(repository ?? FakeBookingRepository());
}

ServiceHistoryDto testServiceHistory({
  String id = 'history-1',
  String? itemName,
}) => ServiceHistoryDto(
  id: id,
  bookingId: 'booking-1',
  catalogItemId: 'catalog-1',
  performedAt: DateTime.utc(2026, 8, 30, 11),
  clientRating: 5,
  clientNotes: 'Great fade',
  barber: const HistoryBarberDto(id: 'barber-1', name: 'Karim'),
  branch: const HistoryBranchDto(id: 'branch-1', name: 'Riyadh Downtown'),
  catalogItem: HistoryCatalogItemDto(
    id: 'catalog-1',
    name: {'en': itemName ?? 'Classic Fade'},
  ),
  createdAt: DateTime.utc(2026, 8, 30, 12),
);

PaginatedData<ServiceHistoryDto> testHistoryPage({
  List<ServiceHistoryDto>? items,
  int currentPage = 1,
  int totalPages = 1,
}) {
  final data = items ?? [testServiceHistory()];
  return PaginatedData(
    data: data,
    meta: PaginationMeta(
      total: data.length,
      count: data.length,
      perPage: 15,
      currentPage: currentPage,
      totalPages: totalPages,
    ),
  );
}

class FakeHistoryRepository implements HistoryRepository {
  PaginatedData<ServiceHistoryDto> firstPage = testHistoryPage();
  PaginatedData<ServiceHistoryDto>? morePage;
  Object? error;
  Object? rebookError;

  int getHistoryCalls = 0;
  int lastPage = 1;
  int rebookCalls = 0;
  String? lastRebookedId;
  DateTime? lastRebookSlot;

  @override
  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoPath,
    required String photoType,
  }) async =>
      HistoryMediaDto(id: 'media-1', photoUrl: 'https://example.com/$photoPath');

  @override
  Future<ServiceHistoryDto> updateEntry({
    required String historyId,
    int? clientRating,
    String? clientNotes,
  }) async => firstPage.data.firstWhere((entry) => entry.id == historyId);

  @override
  Future<PaginatedData<ServiceHistoryDto>> getHistory({
    int page = 1,
    int perPage = 15,
  }) async {
    getHistoryCalls++;
    lastPage = page;
    final failure = error;
    if (failure != null) throw failure;
    if (page > 1 && morePage != null) return morePage!;
    return firstPage;
  }

  @override
  Future<BookingDto> rebookFromHistory(
    String historyId,
    DateTime timeSlot,
  ) async {
    rebookCalls++;
    lastRebookedId = historyId;
    lastRebookSlot = timeSlot;
    final failure = rebookError;
    if (failure != null) throw failure;
    return testBooking(id: 'booking-2');
  }
}

HistoryBloc fakeHistoryBloc({FakeHistoryRepository? repository}) {
  return HistoryBloc(repository ?? FakeHistoryRepository());
}

FloorPlanDto testFloorPlan() => const FloorPlanDto(
  branchId: '1',
  branchName: 'Branch 1',
  chairs: [
    FloorChairDto(id: 'chair-1', label: 'A', status: ChairStatus.available),
    FloorChairDto(id: 'chair-2', label: 'B', status: ChairStatus.occupied),
  ],
);

DateTime testSlotStart() => DateTime.utc(2026, 9, 10, 14, 30);

List<SlotDto> testSlots({
  DateTime? startsAt,
  int count = 1,
  Duration step = const Duration(minutes: 30),
}) {
  final start = startsAt ?? testSlotStart();
  return List<SlotDto>.generate(
    count,
    (index) => SlotDto(
      startsAt: start.add(step * index),
      endsAt: start.add(step * index + step),
    ),
  );
}

class FakeBranchRepository implements BranchRepository {
  FloorPlanDto plan = testFloorPlan();
  List<SlotDto> slots = testSlots();
  Object? error;
  Object? slotsError;
  int getFloorPlanCalls = 0;
  int getBranchSlotsCalls = 0;
  DateTime? lastSlotsDate;
  List<String>? lastSlotsServiceIds;
  String? lastSlotsChairId;

  @override
  Future<FloorPlanDto> getFloorPlan(
    String branchId, {
    required DateTime timeSlot,
    required int durationMinutes,
  }) async {
    getFloorPlanCalls++;
    final failure = error;
    if (failure != null) throw failure;
    return plan;
  }

  @override
  Future<List<SlotDto>> getBranchSlots(
    String branchId, {
    required DateTime date,
    required List<String> serviceIds,
    String? chairId,
    String? barberId,
  }) async {
    getBranchSlotsCalls++;
    lastSlotsDate = date;
    lastSlotsServiceIds = serviceIds;
    lastSlotsChairId = chairId;
    final failure = slotsError;
    if (failure != null) throw failure;
    return slots;
  }
}

BranchDetailBloc fakeBranchDetailBloc({
  FakeExploreRepository? explore,
  FakeBranchRepository? branches,
  FakeBookingRepository? bookings,
}) {
  return BranchDetailBloc(
    explore ?? FakeExploreRepository(),
    branches ?? FakeBranchRepository(),
    bookings ?? FakeBookingRepository(),
    FakeLocationProvider(),
    InMemoryAppPreferences(),
  );
}

FavoritesBloc fakeFavoritesBloc() => FavoritesBloc(FakeFavoriteRepository());

class FakeFavoriteRepository implements FavoriteRepository {
  @override
  Future<ClientFavoriteDto> addFavorite({
    required String favorableId,
    required String favorableType,
  }) => throw UnimplementedError();

  @override
  Future<PaginatedData<ClientFavoriteDto>> getFavorites({
    int page = 1,
    int perPage = 20,
  }) async => const PaginatedData(data: [], meta: PaginationMeta.empty());

  @override
  Future<void> removeFavorite(String favoriteId) async {}
}

DiscoveryBloc fakeDiscoveryBloc({
  FakeExploreRepository? repository,
  FakeLocationProvider? location,
  FakeFeedCache? cache,
  DateTime Function()? clock,
}) {
  return DiscoveryBloc(
    repository ?? FakeExploreRepository(),
    location ?? FakeLocationProvider(),
    cache: cache ?? FakeFeedCache(),
    clock: clock,
  );
}

ApiException unauthorized() => const ApiException(
  statusCode: 401,
  code: 'UNKNOWN',
  message: 'Unauthenticated.',
);

NetworkException offline() => const NetworkException(
  type: DioExceptionType.connectionError,
  retryable: true,
  message: 'Connection refused',
);

FacePhotoDto testFacePhoto({String id = 'photo-1'}) => FacePhotoDto(
  id: id,
  imageUrl: 'https://cdn.example.com/face-$id.jpg',
  isPrimary: false,
  uploadedAt: DateTime.utc(2026, 9, 10, 12),
);

FaceAnalysisResultDto testFaceAnalysis({
  String id = 'analysis-1',
  String shape = 'oval',
  double confidence = 0.9,
  List<String>? recommendedIds = const ['catalog-1'],
  String? photoUrl = 'https://cdn.example.com/face-photo-1.jpg',
}) => FaceAnalysisResultDto(
  id: id,
  faceProfileId: 'photo-1',
  detectedFaceShape: shape,
  confidenceScore: confidence,
  recommendedCatalogItemIds: recommendedIds,
  computedAt: DateTime.utc(2026, 9, 10, 11),
  faceProfile: photoUrl == null
      ? null
      : FacePhotoDto(
          id: 'photo-1',
          imageUrl: photoUrl,
          isPrimary: false,
          uploadedAt: DateTime.utc(2026, 9, 10, 12),
        ),
  createdAt: DateTime.utc(2026, 9, 10, 13),
);

CatalogItemDto testCatalogItem({
  String id = 'catalog-1',
  String name = 'Classic Fade',
  num min = 50,
  num max = 90,
  String currency = 'SAR',
  String? stylePeriod = 'Modern',
}) => CatalogItemDto(
  id: id,
  name: {'en': name},
  priceRange: CatalogPriceRangeDto(min: min, max: max, currency: currency),
  faceShapes: const ['oval'],
  stylePeriod: stylePeriod,
);

PaginatedData<CatalogItemDto> testCatalogPage({List<CatalogItemDto>? items}) {
  final data = items ?? [testCatalogItem()];
  return PaginatedData(
    data: data,
    meta: PaginationMeta(
      total: data.length,
      count: data.length,
      perPage: 100,
      currentPage: 1,
      totalPages: 1,
    ),
  );
}

class FakePhotoPicker implements PhotoPicker {
  String? path;
  int pickCalls = 0;

  @override
  Future<String?> pickPhoto() async {
    pickCalls++;
    return path;
  }
}

class FakeFaceProfileRepository implements FaceProfileRepository {
  List<FaceAnalysisResultDto> recommendations = const [];
  Object? uploadError;
  Object? recommendationsError;
  List<FaceProfileAnalysisStatus?> profileStatuses = const [
    FaceProfileAnalysisStatus.pending,
  ];
  Object? profileError;
  int profileCalls = 0;

  int uploadCalls = 0;
  int recommendationsCalls = 0;
  String? lastUploadedPath;
  bool? lastIsPrimary;

  @override
  Future<FacePhotoDto> uploadFacePhoto(
    String filePath, {
    bool isPrimary = false,
  }) async {
    uploadCalls++;
    lastUploadedPath = filePath;
    lastIsPrimary = isPrimary;
    final failure = uploadError;
    if (failure != null) throw failure;
    return testFacePhoto();
  }

  @override
  Future<List<FaceAnalysisResultDto>> getRecommendations() async {
    recommendationsCalls++;
    final failure = recommendationsError;
    if (failure != null) throw failure;
    return recommendations;
  }

  @override
  Future<FacePhotoDto> getProfile(String id) async {
    profileCalls++;
    final failure = profileError;
    if (failure != null) throw failure;
    final index = profileCalls - 1;
    final status =
        profileStatuses[index < profileStatuses.length
            ? index
            : profileStatuses.length - 1];
    return FacePhotoDto(
      id: id,
      imageUrl: 'https://cdn.example.com/face-$id.jpg',
      analysisStatus: status,
    );
  }
}

class FakeProfileRepository implements ProfileRepository {
  Object? getProfileError;
  int getProfileCalls = 0;

  @override
  Future<ClientDto> getProfile() async {
    getProfileCalls++;
    final failure = getProfileError;
    if (failure != null) throw failure;
    return ClientDto(
      id: 'uuid-1',
      name: 'Sara',
      email: 'sara@example.com',
      emailVerifiedAt: DateTime.utc(2026, 1, 1),
    );
  }

  String avatarUrl = 'https://cdn.example.com/avatar.jpg';
  Object? uploadError;
  int avatarUploadCalls = 0;
  String? lastAvatarPath;
  Object? updateError;
  int updateCalls = 0;
  String? lastName;
  Object? requestOtpError;
  Object? verifyOtpError;
  int requestOtpCalls = 0;
  int verifyOtpCalls = 0;
  String? lastOtpPhone;
  String? lastOtpCode;
  String? lastEmail;

  @override
  Future<AvatarDto> uploadAvatar(String filePath) async {
    avatarUploadCalls++;
    lastAvatarPath = filePath;
    final failure = uploadError;
    if (failure != null) throw failure;
    return AvatarDto(avatarUrl: avatarUrl);
  }

  @override
  Future<ClientDto> updateProfile({String? name, String? email}) async {
    updateCalls++;
    lastName = name;
    final failure = updateError;
    if (failure != null) throw failure;
    lastEmail = email;
    final emailChanged = email != null && email != 'sara@example.com';
    return ClientDto(
      id: 'uuid-1',
      name: name ?? 'Sara',
      email: email ?? 'sara@example.com',
      emailVerifiedAt: emailChanged ? null : DateTime.utc(2026, 1, 1),
    );
  }

  @override
  Future<void> requestPhoneOtp(String phone) async {
    requestOtpCalls++;
    lastOtpPhone = phone;
    final failure = requestOtpError;
    if (failure != null) throw failure;
  }

  @override
  Future<ClientDto> verifyPhoneOtp(String code) async {
    verifyOtpCalls++;
    lastOtpCode = code;
    final failure = verifyOtpError;
    if (failure != null) throw failure;
    return ClientDto(
      id: 'uuid-1',
      name: 'Sara',
      email: 'sara@example.com',
      phone: lastOtpPhone,
      phoneVerifiedAt: DateTime.utc(2026, 2, 1),
      emailVerifiedAt: DateTime.utc(2026, 1, 1),
    );
  }

  @override
  Future<UniversePreferenceDto> updatePreferredUniverse(String universe) async {
    return UniversePreferenceDto(preferredUniverse: universe);
  }

  SettingsDto settings = const SettingsDto(notificationEnabled: true);
  Object? getSettingsError;
  Object? updateSettingsError;
  int getSettingsCalls = 0;
  int updateSettingsCalls = 0;

  @override
  Future<SettingsDto> getSettings() async {
    getSettingsCalls++;
    final failure = getSettingsError;
    if (failure != null) throw failure;
    return settings;
  }

  @override
  Future<SettingsDto> updateSettings({
    String? preferredLanguage,
    bool? notificationEnabled,
    String? displayCurrencyId,
    String? theme,
    String? priceDisplayMode,
  }) async {
    updateSettingsCalls++;
    final failure = updateSettingsError;
    if (failure != null) throw failure;
    settings = SettingsDto(
      preferredLanguage: preferredLanguage ?? settings.preferredLanguage,
      notificationEnabled: notificationEnabled ?? settings.notificationEnabled,
      displayCurrencyId: displayCurrencyId ?? settings.displayCurrencyId,
      theme: theme ?? settings.theme,
      priceDisplayMode: priceDisplayMode ?? settings.priceDisplayMode,
    );
    return settings;
  }
}

class FakeServiceCatalogRepository implements ServiceCatalogRepository {
  PaginatedData<CatalogItemDto> page = testCatalogPage();
  Object? error;

  int calls = 0;
  int lastPage = 1;

  @override
  Future<PaginatedData<CatalogItemDto>> getCatalogItems({
    int page = 1,
    int perPage = 100,
  }) async {
    calls++;
    lastPage = page;
    final failure = error;
    if (failure != null) throw failure;
    return this.page;
  }
}

FaceAnalysisBloc fakeFaceAnalysisBloc({
  FakeFaceProfileRepository? face,
  FakeServiceCatalogRepository? catalog,
}) {
  return FaceAnalysisBloc(
    face ?? FakeFaceProfileRepository(),
    catalog ?? FakeServiceCatalogRepository(),
  );
}

AvatarBloc fakeAvatarBloc({FakeProfileRepository? repository}) {
  return AvatarBloc(repository ?? FakeProfileRepository());
}

BarberProfileDto testBarberProfile({
  String id = 'barber-1',
  String name = 'Karim',
  String email = 'karim@example.com',
  bool isFreelancer = false,
  String status = 'active',
  double? travelRadius,
  double latitude = 24.7136,
  double longitude = 46.6753,
  double? distance,
  double? compatibilityScore = 0.85,
  int? rank = 3,
  DateTime? createdAt,
  List<BarberServiceDto>? services,
}) => BarberProfileDto(
  id: id,
  name: name,
  email: email,
  isFreelancer: isFreelancer,
  status: status,
  travelRadius: travelRadius,
  latitude: latitude,
  longitude: longitude,
  distance: distance,
  compatibilityScore: compatibilityScore,
  rank: rank,
  createdAt: createdAt,
  services:
      services ??
      const [
        BarberServiceDto(
          id: 'svc-1',
          name: 'Fade',
          description: 'Classic fade cut',
          price: 80,
          currencyId: 'curr-1',
          duration: 30,
          atHome: false,
          active: true,
        ),
        BarberServiceDto(
          id: 'svc-2',
          name: 'Beard Trim',
          price: 30,
          currencyId: 'curr-1',
          duration: 15,
          atHome: true,
          active: true,
        ),
      ],
);

CurrencyDto testCurrency({
  String id = 'curr-1',
  String code = 'SAR',
  String? symbol,
  bool isDefault = true,
}) => CurrencyDto(id: id, code: code, symbol: symbol, isDefault: isDefault);

class FakeCurrencyRepository implements CurrencyRepository {
  List<CurrencyDto> currencies = [testCurrency()];
  Object? error;
  int calls = 0;

  @override
  Future<List<CurrencyDto>> getCurrencies() async {
    calls++;
    final failure = error;
    if (failure != null) throw failure;
    return currencies;
  }
}

StylistProfileBloc fakeStylistProfileBloc({
  FakeExploreRepository? explore,
  FakeCurrencyRepository? currencies,
}) {
  return StylistProfileBloc(
    explore ?? FakeExploreRepository(),
    currencies ?? FakeCurrencyRepository(),
  );
}

ReviewDto testReview({
  String id = 'review-1',
  int rating = 5,
  String? comment = 'Great fade',
  String? authorName = 'Karim',
  ReviewStatus? status = ReviewStatus.published,
  DateTime? disputedAt,
  DateTime? resolvedAt,
}) => ReviewDto(
  id: id,
  rating: rating,
  comment: comment,
  authorName: authorName,
  status: status,
  disputedAt: disputedAt,
  resolvedAt: resolvedAt,
  createdAt: DateTime.utc(2026, 9, 10, 12),
);

class FakeReviewRepository implements ReviewRepository {
  Object? submitError;
  Object? reviewsError;

  int submitCalls = 0;
  int reviewsCalls = 0;
  String? lastBookingId;
  int? lastRating;
  String? lastComment;
  int? lastBarberRating;
  String? lastBarberId;
  ReviewDto? submittedReview;

  PaginatedData<ReviewDto> reviewsPage = PaginatedData(
    data: const [],
    meta: const PaginationMeta.empty(),
  );

  @override
  Future<ReviewDto> submitReview(
    String bookingId, {
    required int rating,
    String? comment,
    int? barberRating,
  }) async {
    submitCalls++;
    lastBarberRating = barberRating;
    lastBookingId = bookingId;
    lastRating = rating;
    lastComment = comment;
    final failure = submitError;
    if (failure != null) throw failure;
    return submittedReview ?? testReview(rating: rating, comment: comment);
  }

  @override
  Future<PaginatedData<ReviewDto>> getBranchReviews(
    String branchId, {
    int page = 1,
    int perPage = 20,
  }) async {
    reviewsCalls++;
    final failure = reviewsError;
    if (failure != null) throw failure;
    return reviewsPage;
  }

  @override
  Future<PaginatedData<ReviewDto>> getBarberReviews(
    String barberId, {
    int page = 1,
    int perPage = 20,
  }) async {
    reviewsCalls++;
    lastBarberId = barberId;
    final failure = reviewsError;
    if (failure != null) throw failure;
    return reviewsPage;
  }
}

ReviewSubmitBloc fakeReviewSubmitBloc({FakeReviewRepository? repository}) {
  return ReviewSubmitBloc(repository ?? FakeReviewRepository());
}

NotificationDto testNotification({
  String id = 'notification-1',
  String title = 'Booking confirmed',
  DateTime? readAt,
  String type = 'booking_update',
  Map<String, dynamic> data = const {'booking_id': 'booking-1'},
}) => NotificationDto(
  id: id,
  type: type,
  title: title,
  body: 'Your booking is confirmed',
  data: data,
  readAt: readAt,
  createdAt: DateTime.utc(2026, 10, 22, 10),
);

PaginatedData<NotificationDto> testNotificationPage({
  List<NotificationDto>? notifications,
  int currentPage = 1,
  int totalPages = 1,
}) {
  final items = notifications ?? [testNotification()];
  return PaginatedData(
    data: items,
    meta: PaginationMeta(
      total: items.length,
      count: items.length,
      perPage: 20,
      currentPage: currentPage,
      totalPages: totalPages,
    ),
  );
}

class FakeNotificationRepository implements NotificationRepository {
  PaginatedData<NotificationDto> firstPage = testNotificationPage();
  PaginatedData<NotificationDto>? morePage;
  Object? error;
  Object? markError;

  int getNotificationsCalls = 0;
  int markReadCalls = 0;
  int markAllReadCalls = 0;
  int lastPage = 1;
  String? lastMarkedId;

  @override
  Future<PaginatedData<NotificationDto>> getNotifications({
    int page = 1,
    int perPage = 20,
  }) async {
    getNotificationsCalls++;
    lastPage = page;
    final failure = error;
    if (failure != null) throw failure;
    if (page > 1 && morePage != null) return morePage!;
    return firstPage;
  }

  @override
  Future<NotificationDto> markRead(String notificationId) async {
    markReadCalls++;
    lastMarkedId = notificationId;
    final failure = markError;
    if (failure != null) throw failure;
    final readAt = DateTime.utc(2026, 10, 22, 11);
    final updated = firstPage.data.map(
      (item) => item.id == notificationId
          ? testNotification(id: item.id, title: item.title, readAt: readAt)
          : item,
    );
    firstPage = testNotificationPage(notifications: updated.toList());
    return firstPage.data.firstWhere((item) => item.id == notificationId);
  }

  @override
  Future<void> markAllRead() async {
    markAllReadCalls++;
    final failure = markError;
    if (failure != null) throw failure;
    final readAt = DateTime.utc(2026, 10, 22, 11);
    firstPage = testNotificationPage(
      notifications: firstPage.data
          .map(
            (item) => testNotification(
              id: item.id,
              title: item.title,
              readAt: item.readAt ?? readAt,
            ),
          )
          .toList(),
    );
  }
}

NotificationsBloc fakeNotificationsBloc([
  FakeNotificationRepository? repository,
]) => NotificationsBloc(repository ?? FakeNotificationRepository());
