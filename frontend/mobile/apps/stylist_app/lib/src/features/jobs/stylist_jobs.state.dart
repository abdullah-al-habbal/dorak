import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistJobsState extends Equatable {
  StylistJobsState({
    this.loading = false,
    this.applyingJobId,
    List<JobPostingDto> jobs = const [],
    List<JobApplicationDto> applications = const [],
    this.error,
  }) : jobs = List.unmodifiable(jobs),
       applications = List.unmodifiable(applications);

  final bool loading;
  final String? applyingJobId;
  final List<JobPostingDto> jobs;
  final List<JobApplicationDto> applications;
  final Object? error;

  bool hasApplied(String jobId) =>
      applications.any((application) => application.jobPostingId == jobId);

  JobPostingDto? jobById(String id) {
    for (final job in jobs) {
      if (job.id == id) return job;
    }
    return null;
  }

  StylistJobsState copyWith({
    bool? loading,
    String? applyingJobId,
    bool clearApplying = false,
    List<JobPostingDto>? jobs,
    List<JobApplicationDto>? applications,
    Object? error,
    bool clearError = false,
  }) => StylistJobsState(
    loading: loading ?? this.loading,
    applyingJobId: clearApplying ? null : applyingJobId ?? this.applyingJobId,
    jobs: jobs ?? this.jobs,
    applications: applications ?? this.applications,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [
    loading,
    applyingJobId,
    jobs,
    applications,
    error,
  ];
}
