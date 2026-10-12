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
  Future<JobApplicationDto> updateBranchApplicationStatus(
    String jobId,
    String applicationId,
    String status,
  );
  Future<Map<String, dynamic>> updateBranchFloorPlan({
    required String preset,
    List<Map<String, dynamic>> zones = const [],
  });
}

class DioJobPostingRepository implements JobPostingRepository {
  const DioJobPostingRepository(this._client);
  final ApiClient _client;
  @override
  Future<PaginatedData<JobPostingDto>> getJobs({int perPage = 20}) =>
      _client.getPaginated(
        JobPostingEndpoints.jobs,
        queryParameters: {'per_page': perPage},
        itemParser: (json) =>
            JobPostingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<JobPostingDto> getJob(String id) => _client.get(
    JobPostingEndpoints.job(id),
    parser: (json) => JobPostingDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<JobApplicationDto> apply(String jobId, {String? coverLetter}) =>
      _client.post(
        JobPostingEndpoints.apply(jobId),
        data: {'cover_letter': ?coverLetter},
        parser: (json) =>
            JobApplicationDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<PaginatedData<JobApplicationDto>> getApplications({String? status}) =>
      _client.getPaginated(
        JobPostingEndpoints.applications,
        queryParameters: {'status': ?status},
        itemParser: (json) =>
            JobApplicationDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<PaginatedData<JobPostingDto>> getBranchJobPostings() =>
      _client.getPaginated(
        JobPostingEndpoints.branchJobPostings,
        itemParser: (json) =>
            JobPostingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<JobPostingDto> saveBranchJobPosting(
    Map<String, dynamic> values, {
    String? id,
  }) => id == null
      ? _client.post(
          JobPostingEndpoints.branchJobPostings,
          data: values,
          parser: (json) =>
              JobPostingDto.fromJson(json as Map<String, dynamic>),
        )
      : _client.put(
          JobPostingEndpoints.branchJobPosting(id),
          data: values,
          parser: (json) =>
              JobPostingDto.fromJson(json as Map<String, dynamic>),
        );
  @override
  Future<void> deleteBranchJobPosting(String id) =>
      _client.delete(JobPostingEndpoints.branchJobPosting(id));
  @override
  Future<PaginatedData<JobApplicationDto>> getBranchApplications(
    String jobId,
  ) => _client.getPaginated(
    JobPostingEndpoints.branchApplications(jobId),
    itemParser: (json) =>
        JobApplicationDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<JobApplicationDto> updateBranchApplicationStatus(
    String jobId,
    String applicationId,
    String status,
  ) => _client.patch(
    JobPostingEndpoints.branchApplicationStatus(jobId, applicationId),
    data: {'status': status},
    parser: (json) => JobApplicationDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<Map<String, dynamic>> updateBranchFloorPlan({
    required String preset,
    List<Map<String, dynamic>> zones = const [],
  }) => _client.patch(
    JobPostingEndpoints.branchFloorPlan,
    data: {'preset': preset, 'zones': zones},
    parser: (json) => Map<String, dynamic>.from(json as Map),
  );
}
