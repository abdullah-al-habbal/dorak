import 'package:core/core.dart';

abstract class JobPostingRepository {
  Future<PaginatedData<JobPostingDto>> getJobs({int perPage = 20});
  Future<JobPostingDto> getJob(String id);
  Future<JobApplicationDto> apply(String jobId, {String? coverLetter});
  Future<PaginatedData<JobApplicationDto>> getApplications({String? status});
  Future<PaginatedData<JobPostingDto>> getBranchJobPostings();
  Future<JobPostingDto> saveBranchJobPosting(
    Map<String, dynamic> values, {
    String? id,
  });
  Future<void> deleteBranchJobPosting(String id);
  Future<PaginatedData<JobApplicationDto>> getBranchApplications(String jobId);
  Future<void> markBranchApplicationsSeen(String jobId);
  Future<JobApplicationDto> updateBranchApplicationStatus(
    String jobId,
    String applicationId,
    String status,
  );
}

class DioJobPostingRepository implements JobPostingRepository {
  const DioJobPostingRepository(this._client);
  final ApiClient _client;
  @override
  Future<PaginatedData<JobPostingDto>> getJobs({int perPage = 20}) =>
      _client.getPaginated(
        ApiEndpoints.jobPosting.jobs,
        queryParameters: {'per_page': perPage},
        itemParser: (json) =>
            JobPostingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<JobPostingDto> getJob(String id) => _client.get(
    ApiEndpoints.jobPosting.job(id),
    parser: (json) => JobPostingDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<JobApplicationDto> apply(String jobId, {String? coverLetter}) =>
      _client.post(
        ApiEndpoints.jobPosting.apply(jobId),
        data: {'cover_letter': ?coverLetter},
        parser: (json) =>
            JobApplicationDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<PaginatedData<JobApplicationDto>> getApplications({String? status}) =>
      _client.getPaginated(
        ApiEndpoints.jobPosting.applications,
        queryParameters: {'status': ?status},
        itemParser: (json) =>
            JobApplicationDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<PaginatedData<JobPostingDto>> getBranchJobPostings() =>
      _client.getPaginated(
        ApiEndpoints.jobPosting.branchJobPostings,
        itemParser: (json) =>
            JobPostingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<JobPostingDto> saveBranchJobPosting(
    Map<String, dynamic> values, {
    String? id,
  }) => id == null
      ? _client.post(
          ApiEndpoints.jobPosting.branchJobPostings,
          data: values,
          parser: (json) =>
              JobPostingDto.fromJson(json as Map<String, dynamic>),
        )
      : _client.put(
          ApiEndpoints.jobPosting.branchJobPosting(id),
          data: values,
          parser: (json) =>
              JobPostingDto.fromJson(json as Map<String, dynamic>),
        );
  @override
  Future<void> deleteBranchJobPosting(String id) =>
      _client.delete(ApiEndpoints.jobPosting.branchJobPosting(id));
  @override
  Future<PaginatedData<JobApplicationDto>> getBranchApplications(
    String jobId,
  ) => _client.getPaginated(
    ApiEndpoints.jobPosting.branchApplications(jobId),
    itemParser: (json) =>
        JobApplicationDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<void> markBranchApplicationsSeen(String jobId) => _client.post<void>(
    ApiEndpoints.jobPosting.branchApplicationsSeen(jobId),
    parser: _discardBody,
  );
  @override
  Future<JobApplicationDto> updateBranchApplicationStatus(
    String jobId,
    String applicationId,
    String status,
  ) => _client.patch(
    ApiEndpoints.jobPosting.branchApplicationStatus(jobId, applicationId),
    data: {'status': status},
    parser: (json) => JobApplicationDto.fromJson(json as Map<String, dynamic>),
  );

  static void _discardBody(dynamic _) {}
}
