import 'package:core/core.dart';

import 'package:stylist_app/src/core/stylist_feature_blocs.provider.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.bloc.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.bloc.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.bloc.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.bloc.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/portfolio/photo_picker.provider.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';
import 'package:stylist_app/src/features/services/stylist_services.bloc.dart';

BookingDto bookingFixture(String id, {BookingStatus? status}) => BookingDto(
  id: id,
  startsAt: DateTime.utc(2026, 10, 29, 10),
  status: status ?? BookingStatus.pending,
);

PaginatedData<T> pageOf<T>(List<T> items) => PaginatedData(
  data: items,
  meta: PaginationMeta(
    total: items.length,
    count: items.length,
    perPage: 15,
    currentPage: 1,
    totalPages: 1,
  ),
);

/// Configurable fake; every method not exercised by a test throws.
class FakeStylistOperationsRepository implements StylistOperationsRepository {
  List<BookingDto> today = [];
  Object? cancelError;
  String? cancelledId;
  String? cancelReason;
  List<BarberScheduleDayDto> schedule = [];
  List<BarberScheduleDayDto>? savedSchedule;
  List<PortfolioPhotoDto> portfolio = [];
  String? uploadedPath;
  String? deletedPhotoId;
  double? savedRadius;
  Map<String, String>? savedBio;
  List<BarberServiceDto> services = [];
  Object? serviceFailure;
  Map<String, String>? createdServiceName;
  String? updatedServiceId;
  String? deletedServiceId;

  @override
  Future<BarberProfileDto> getProfile() async =>
      const BarberProfileDto(id: 'barber-1', name: 'Barber', email: 'b@x.com');

  @override
  Future<PaginatedData<BookingDto>> getTodayAppointments() async =>
      pageOf(today);

  @override
  Future<BookingDto> cancelBooking(String id, {required String reason}) async {
    final error = cancelError;
    if (error != null) throw error;
    cancelledId = id;
    cancelReason = reason;
    return bookingFixture(id, status: BookingStatus.cancelled);
  }

  @override
  Future<List<BarberScheduleDayDto>> getSchedule() async => schedule;

  @override
  Future<List<BarberScheduleDayDto>> updateSchedule(
    List<BarberScheduleDayDto> days,
  ) async {
    savedSchedule = days;
    return days;
  }

  @override
  Future<List<PortfolioPhotoDto>> getPortfolio() async => portfolio;

  @override
  Future<PortfolioPhotoDto> uploadPortfolioPhoto(String filePath) async {
    uploadedPath = filePath;
    return PortfolioPhotoDto(id: 'uploaded', url: 'http://x/u.jpg');
  }

  @override
  Future<void> deletePortfolioPhoto(String id) async => deletedPhotoId = id;

  @override
  Future<BarberProfileDto> updateTravelRadius(double radiusKm) async {
    savedRadius = radiusKm;
    return BarberProfileDto(
      id: 'barber-1',
      name: 'Barber',
      email: 'b@x.com',
      travelRadiusKm: radiusKm,
    );
  }

  @override
  Future<BarberProfileDto> updateProfile({Map<String, String>? bio}) async {
    savedBio = bio;
    return getProfile();
  }

  @override
  Future<bool> updateWorkstationStatus(bool online) =>
      throw UnimplementedError();

  @override
  Future<BookingDto> transitionBooking(String id, BarberBookingAction action) =>
      throw UnimplementedError();

  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? body,
  }) => throw UnimplementedError();

  @override
  Future<List<BarberServiceDto>> getServices() async {
    if (serviceFailure != null) throw serviceFailure!;
    return services;
  }

  @override
  Future<BarberServiceDto> createService({
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  }) async {
    if (serviceFailure != null) throw serviceFailure!;
    createdServiceName = name;
    final created = BarberServiceDto(
      id: 'svc-${services.length + 1}',
      name: name['en']!,
      priceAmountMinor: MinorUnits.fromMajor(price),
      currencyCode: currencyCode,
      durationMinutes: durationMinutes,
      active: active,
    );
    services = [...services, created];
    return created;
  }

  @override
  Future<BarberServiceDto> updateService(
    String id, {
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  }) async {
    if (serviceFailure != null) throw serviceFailure!;
    updatedServiceId = id;
    return services.firstWhere((service) => service.id == id);
  }

  @override
  Future<void> deleteService(String id) async {
    if (serviceFailure != null) throw serviceFailure!;
    deletedServiceId = id;
    services = services.where((service) => service.id != id).toList();
  }
}

class FakeStylistAppointmentRepository implements StylistAppointmentRepository {
  List<BookingDto> history = [];
  final List<BookingStatus?> requestedStatuses = [];
  Object? failure;

  @override
  Future<PaginatedData<BookingDto>> getAppointments({
    BookingStatus? status,
    DateTime? from,
    DateTime? to,
    int page = 1,
    int perPage = 15,
  }) async {
    if (failure != null) throw failure!;
    requestedStatuses.add(status);
    return pageOf([
      for (final booking in history)
        if (status == null || booking.status == status) booking,
    ]);
  }
}

class FakeEarningsRepository implements EarningsRepository {
  EarningsDto earnings = const EarningsDto(scope: 'barber');
  final List<DateTime?> fromRequests = [];
  Object? failure;

  @override
  Future<EarningsDto> getEarnings({DateTime? from, DateTime? to}) async {
    if (failure != null) throw failure!;
    fromRequests.add(from);
    return earnings;
  }
}

class FakeNotificationRepository implements NotificationRepository {
  List<NotificationDto> items = [];
  final List<String> read = [];
  bool allRead = false;

  NotificationDto _asRead(NotificationDto item) => NotificationDto(
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    readAt: DateTime.utc(2026, 11, 3),
  );

  @override
  Future<PaginatedData<NotificationDto>> getNotifications({
    int page = 1,
    int perPage = 20,
  }) async => pageOf(items);

  @override
  Future<NotificationDto> markRead(String notificationId) async {
    read.add(notificationId);
    items = [
      for (final item in items)
        item.id == notificationId ? _asRead(item) : item,
    ];
    return items.firstWhere((item) => item.id == notificationId);
  }

  @override
  Future<void> markAllRead() async {
    allRead = true;
    items = [for (final item in items) _asRead(item)];
  }
}

class FakePhotoPicker implements PhotoPicker {
  String? path = '/tmp/photo.jpg';

  @override
  Future<String?> pickPhoto() async => path;
}

class FakeAffiliationRepository implements AffiliationRepository {
  List<BarberAffiliationDto> affiliations = const [
    BarberAffiliationDto(
      id: 'a1',
      barberId: 'barber-1',
      affiliableId: 'branch-1',
      affiliableType: 'branch',
      status: 'pending',
    ),
  ];

  @override
  Future<List<BarberAffiliationDto>> getBarberAffiliations(
    String barberId,
  ) async => affiliations;

  @override
  Future<BarberAffiliationDto> acceptAffiliation(String id) async =>
      BarberAffiliationDto(
        id: id,
        barberId: 'barber-1',
        affiliableId: 'branch-1',
        affiliableType: 'branch',
        status: 'active',
      );

  @override
  Future<BarberAffiliationDto> rejectAffiliation(String id) async =>
      BarberAffiliationDto(
        id: id,
        barberId: 'barber-1',
        affiliableId: 'branch-1',
        affiliableType: 'branch',
        status: 'rejected',
      );

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class FakeJobPostingRepository implements JobPostingRepository {
  List<JobPostingDto> jobs = const [
    JobPostingDto(
      id: 'job-1',
      title: {'en': 'Barber'},
      description: {'en': 'Fade'},
      status: 'open',
      branchId: 'branch-1',
    ),
  ];
  int applyCalls = 0;
  Object? secondApplyError;

  @override
  Future<PaginatedData<JobPostingDto>> getJobs({int perPage = 20}) async =>
      pageOf(jobs);

  @override
  Future<PaginatedData<JobApplicationDto>> getApplications({
    String? status,
  }) async => pageOf(const <JobApplicationDto>[]);

  @override
  Future<JobPostingDto> getJob(String id) async => jobs.first;

  @override
  Future<JobApplicationDto> apply(String jobId, {String? coverLetter}) async {
    applyCalls++;
    final error = secondApplyError;
    if (applyCalls > 1 && error != null) throw error;
    return JobApplicationDto(
      id: 'application-$applyCalls',
      jobPostingId: jobId,
      barberId: 'barber-1',
      status: 'submitted',
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

StylistFeatureBlocs featureBlocsFor(
  FakeStylistOperationsRepository operations, {
  PhotoPicker? picker,
  FakeAffiliationRepository? affiliations,
  FakeJobPostingRepository? jobs,
  FakeReviewRepository? reviews,
  FakeReviewDisputeRepository? disputes,
  FakeBarberHistoryRepository? history,
  FakeStylistAppointmentRepository? appointments,
  FakeEarningsRepository? earnings,
  FakeNotificationRepository? notifications,
}) => StylistFeatureBlocs(
  schedule: StylistScheduleBloc(operations),
  portfolio: StylistPortfolioBloc(operations, picker ?? FakePhotoPicker()),
  profile: StylistProfileBloc(operations),
  affiliations: StylistAffiliationsBloc(
    affiliations ?? FakeAffiliationRepository(),
    () => 'barber-1',
  ),
  jobs: StylistJobsBloc(jobs ?? FakeJobPostingRepository()),
  reviews: StylistReviewsBloc(
    reviews ?? FakeReviewRepository(),
    disputes ?? FakeReviewDisputeRepository(),
    () => 'barber-1',
  ),
  clientHistory: StylistClientHistoryBloc(
    history ?? FakeBarberHistoryRepository(),
    picker ?? FakePhotoPicker(),
    () => 'barber-1',
  ),
  appointments: StylistAppointmentsBloc(
    appointments ?? FakeStylistAppointmentRepository(),
  ),
  earnings: StylistEarningsBloc(
    earnings ?? FakeEarningsRepository(),
    clock: () => DateTime(2026, 11, 15),
  ),
  services: StylistServicesBloc(operations),
  inbox: StylistInboxBloc(notifications ?? FakeNotificationRepository()),
);

ServiceHistoryDto visitFixture(
  String id, {
  String barberId = 'barber-1',
  List<HistoryMediaDto> media = const [],
}) => ServiceHistoryDto(
  id: id,
  performedAt: DateTime.utc(2026, 10, 29, 10),
  barber: HistoryBarberDto(id: barberId, name: 'Barber'),
  catalogItem: const HistoryCatalogItemDto(
    id: 'c1',
    name: {'en': 'Classic Fade', 'ar': 'فيض كلاسيكي'},
  ),
  media: media,
);

class FakeBarberHistoryRepository implements BarberHistoryRepository {
  List<ServiceHistoryDto> visits = [
    visitFixture('h1'),
    visitFixture('h2', barberId: 'barber-2'),
  ];
  Object? attachError;
  String? requestedClientId;
  String? attachedHistoryId;
  String? attachedPath;
  String? attachedType;

  @override
  Future<PaginatedData<ServiceHistoryDto>> getClientHistory(
    String clientId, {
    int page = 1,
    int perPage = 15,
  }) async {
    requestedClientId = clientId;
    return pageOf(visits);
  }

  @override
  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoPath,
    required String photoType,
  }) async {
    final error = attachError;
    if (error != null) throw error;
    attachedHistoryId = historyId;
    attachedPath = photoPath;
    attachedType = photoType;
    return HistoryMediaDto(
      id: 'm-new',
      photoUrl: 'http://x/m.jpg',
      photoType: photoType,
    );
  }
}

class FakeReviewRepository implements ReviewRepository {
  String? requestedBarberId;

  @override
  Future<PaginatedData<ReviewDto>> getBarberReviews(
    String barberId, {
    int page = 1,
    int perPage = 20,
  }) async {
    requestedBarberId = barberId;
    return pageOf([
      ReviewDto(
        id: 'r1',
        subjectType: ReviewSubjectType.barber,
        subjectId: barberId,
        rating: 2,
        body: 'Late',
        status: ReviewStatus.published,
        createdAt: DateTime.utc(2026, 10, 29),
      ),
    ]);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class FakeReviewDisputeRepository implements ReviewDisputeRepository {
  FakeReviewDisputeRepository({this.failure});

  final Object? failure;
  String? disputedId;
  String? disputeReason;

  @override
  Future<ReviewDto> flagDispute(
    String reviewId, {
    required String reason,
  }) async {
    if (failure != null) throw failure!;
    disputedId = reviewId;
    disputeReason = reason;
    return ReviewDto(
      id: reviewId,
      rating: 2,
      status: ReviewStatus.disputed,
      disputedAt: DateTime.utc(2026, 11, 3),
      createdAt: DateTime.utc(2026, 10, 29),
    );
  }
}
