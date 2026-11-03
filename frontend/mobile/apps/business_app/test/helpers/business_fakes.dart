import 'package:core/core.dart';

import 'package:business_app/src/core/business_feature_blocs.provider.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/earnings/business_earnings.bloc.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';

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

class FakeJobPostingRepository implements JobPostingRepository {
  List<JobPostingDto> jobs = [];
  List<JobApplicationDto> applicants = const [
    JobApplicationDto(
      id: 'app-1',
      jobPostingId: 'job-1',
      barberId: 'barber-1',
      status: 'submitted',
    ),
  ];
  Map<String, dynamic>? savedValues;
  String? decidedStatus;
  String? deletedId;

  @override
  Future<PaginatedData<JobPostingDto>> getBranchJobPostings() async =>
      pageOf(jobs);

  @override
  Future<JobPostingDto> saveBranchJobPosting(
    Map<String, dynamic> values, {
    String? id,
  }) async {
    savedValues = values;
    return JobPostingDto(
      id: id ?? 'job-${jobs.length + 1}',
      title: values['title'] as Map<String, dynamic>,
      description: values['description'] as Map<String, dynamic>,
      status: 'open',
      branchId: 'branch-1',
    );
  }

  @override
  Future<void> deleteBranchJobPosting(String id) async => deletedId = id;

  @override
  Future<PaginatedData<JobApplicationDto>> getBranchApplications(
    String jobId,
  ) async => pageOf(applicants);

  @override
  Future<JobApplicationDto> updateBranchApplicationStatus(
    String jobId,
    String applicationId,
    String status,
  ) async {
    decidedStatus = status;
    return JobApplicationDto(
      id: applicationId,
      jobPostingId: jobId,
      barberId: 'barber-1',
      status: status,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
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
  Future<List<BarberAffiliationDto>> getBranchAffiliations() async =>
      affiliations;

  @override
  Future<BarberAffiliationDto> acceptBranchAffiliation(String id) async =>
      BarberAffiliationDto(
        id: id,
        barberId: 'barber-1',
        affiliableId: 'branch-1',
        affiliableType: 'branch',
        status: 'active',
      );

  @override
  Future<BarberAffiliationDto> rejectBranchAffiliation(String id) async =>
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

class FakeBranchManagementRepository implements BranchManagementRepository {
  String? savedPreset;
  Map<String, String>? savedDescription;
  List<String>? savedTags;

  @override
  Future<Map<String, dynamic>> updateFloorPlan({
    required String preset,
    List<Map<String, dynamic>> zones = const [],
  }) async {
    savedPreset = preset;
    return {'preset': preset};
  }

  @override
  Future<void> updateProfile({
    Map<String, String>? description,
    Map<String, String>? address,
    List<String>? tags,
  }) async {
    savedDescription = description;
    savedTags = tags;
  }

  @override
  Future<PaginatedData<ReviewDto>> getReviews({int perPage = 20}) async =>
      pageOf([
        ReviewDto(
          id: 'r1',
          rating: 4,
          body: 'Great',
          status: ReviewStatus.published,
          createdAt: DateTime.utc(2026, 10, 29),
        ),
      ]);
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
      rating: 4,
      status: ReviewStatus.disputed,
      disputedAt: DateTime.utc(2026, 11, 3),
      createdAt: DateTime.utc(2026, 10, 29),
    );
  }
}

class FakeBranchStaffRepository implements BranchStaffRepository {
  FakeBranchStaffRepository({List<StaffMemberDto>? staff, this.failure})
    : staff = staff ?? [];

  List<StaffMemberDto> staff;
  Object? failure;

  @override
  Future<PaginatedData<StaffMemberDto>> getStaff({
    int page = 1,
    int perPage = 20,
  }) async {
    if (failure != null) throw failure!;
    return pageOf(staff);
  }
}

class FakeActivationRepository implements ManagedBarberRepository {
  final List<String> activated = [];
  final List<String> deactivated = [];
  Object? failure;

  @override
  Future<ActivationLogDto> activateBarber(String barberId) async {
    if (failure != null) throw failure!;
    activated.add(barberId);
    return _log(barberId, 'enabled');
  }

  @override
  Future<ActivationLogDto> deactivateBarber(String barberId) async {
    if (failure != null) throw failure!;
    deactivated.add(barberId);
    return _log(barberId, 'disabled');
  }

  @override
  Future<ManagedBarberDto> createManualBarber({
    required String nameEn,
    required String nameAr,
    required String phone,
    String? chairId,
  }) async => ManagedBarberDto(id: 'new', name: {'en': nameEn, 'ar': nameAr});

  ActivationLogDto _log(String barberId, String status) => ActivationLogDto(
    id: 'log',
    activableId: barberId,
    activableType: 'barber',
    status: status,
  );
}

class FakeBranchServiceRepository implements BranchServiceRepository {
  List<BusinessServiceDto> services = [];
  Object? failure;
  String? createdBrandId;
  Map<String, String>? createdName;
  String? updatedId;
  String? deletedId;

  @override
  Future<PaginatedData<BusinessServiceDto>> getServices({
    int page = 1,
    int perPage = 20,
  }) async {
    if (failure != null) throw failure!;
    return pageOf(services);
  }

  @override
  Future<BusinessServiceDto> createService({
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  }) async {
    if (failure != null) throw failure!;
    createdBrandId = brandId;
    createdName = name;
    final created = BusinessServiceDto(
      id: 'svc-${services.length + 1}',
      serviceableId: brandId,
      name: name['en']!,
      priceAmountMinor: MinorUnits.fromMajor(price),
      currencyCode: currencyCode,
      durationMinutes: durationMinutes,
    );
    services = [...services, created];
    return created;
  }

  @override
  Future<BusinessServiceDto> updateService(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  }) async {
    if (failure != null) throw failure!;
    updatedId = id;
    return services.firstWhere((service) => service.id == id);
  }

  @override
  Future<void> deleteService(String id) async {
    if (failure != null) throw failure!;
    deletedId = id;
    services = services.where((service) => service.id != id).toList();
  }
}

class FakeBranchHoursRepository implements BranchHoursRepository {
  List<BranchOpeningHourDto> hours = const [];
  List<BranchOpeningHourDto>? saved;
  Object? failure;

  @override
  Future<BranchProfileDto> getProfile() async {
    if (failure != null) throw failure!;
    return BranchProfileDto(
      id: 'branch-1',
      name: 'Main',
      brandId: 'brand-1',
      openingHours: hours,
    );
  }

  @override
  Future<void> updateOpeningHours(List<BranchOpeningHourDto> hours) async {
    if (failure != null) throw failure!;
    saved = hours;
  }
}

class FakeEarningsRepository implements EarningsRepository {
  EarningsDto earnings = const EarningsDto(scope: 'branch');
  Object? failure;
  final List<({DateTime? from, DateTime? to})> calls = [];

  @override
  Future<EarningsDto> getEarnings({DateTime? from, DateTime? to}) async {
    calls.add((from: from, to: to));
    if (failure != null) throw failure!;
    return earnings;
  }
}

class FakeNotificationRepository implements NotificationRepository {
  List<NotificationDto> items = [];
  final List<String> read = [];
  bool allRead = false;

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
        if (item.id == notificationId)
          NotificationDto(
            id: item.id,
            type: item.type,
            title: item.title,
            body: item.body,
            readAt: DateTime.utc(2026, 11, 3),
          )
        else
          item,
    ];
    return items.firstWhere((item) => item.id == notificationId);
  }

  @override
  Future<void> markAllRead() async {
    allRead = true;
    items = [
      for (final item in items)
        NotificationDto(
          id: item.id,
          type: item.type,
          title: item.title,
          body: item.body,
          readAt: DateTime.utc(2026, 11, 3),
        ),
    ];
  }
}

BusinessFeatureBlocs featureBlocsFor({
  FakeJobPostingRepository? jobs,
  FakeAffiliationRepository? affiliations,
  FakeBranchManagementRepository? management,
  FakeReviewDisputeRepository? disputes,
  FakeBranchStaffRepository? staff,
  FakeActivationRepository? activation,
  FakeBranchServiceRepository? services,
  FakeBranchHoursRepository? hours,
  FakeNotificationRepository? notifications,
  FakeEarningsRepository? earnings,
}) {
  final branch = management ?? FakeBranchManagementRepository();
  return BusinessFeatureBlocs(
    jobs: BusinessJobsBloc(jobs ?? FakeJobPostingRepository()),
    floorPlan: BusinessFloorPlanBloc(branch),
    affiliations: BusinessAffiliationsBloc(
      affiliations ?? FakeAffiliationRepository(),
    ),
    profile: BusinessProfileBloc(branch),
    reviews: BusinessReviewsBloc(
      branch,
      disputes ?? FakeReviewDisputeRepository(),
    ),
    staff: BusinessStaffBloc(
      staff ?? FakeBranchStaffRepository(),
      activation ?? FakeActivationRepository(),
    ),
    services: BusinessServicesBloc(
      services ?? FakeBranchServiceRepository(),
      hours ?? FakeBranchHoursRepository(),
    ),
    hours: BusinessHoursBloc(hours ?? FakeBranchHoursRepository()),
    inbox: BusinessInboxBloc(notifications ?? FakeNotificationRepository()),
    earnings: BusinessEarningsBloc(earnings ?? FakeEarningsRepository()),
  );
}
