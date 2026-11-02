import 'package:core/core.dart';

import 'package:stylist_app/src/core/stylist_feature_blocs.provider.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/portfolio/photo_picker.provider.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';

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
  Future<List<BarberServiceDto>> getServices() => throw UnimplementedError();

  @override
  Future<BarberServiceDto> createService({
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  }) => throw UnimplementedError();

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
  }) => throw UnimplementedError();

  @override
  Future<void> deleteService(String id) => throw UnimplementedError();
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
);

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
