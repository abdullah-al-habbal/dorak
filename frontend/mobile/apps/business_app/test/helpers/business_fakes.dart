import 'package:core/core.dart';

import 'package:business_app/src/core/business_feature_blocs.provider.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';

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

BusinessFeatureBlocs featureBlocsFor({
  FakeJobPostingRepository? jobs,
  FakeAffiliationRepository? affiliations,
  FakeBranchManagementRepository? management,
  FakeReviewDisputeRepository? disputes,
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
  );
}
