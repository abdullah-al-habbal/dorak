import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessJobsState extends Equatable {
  BusinessJobsState({
    this.loading = false,
    this.saving = false,
    this.saved = false,
    this.busyId,
    List<JobPostingDto> jobs = const [],
    List<JobApplicationDto> applicants = const [],
    this.error,
  }) : jobs = List.unmodifiable(jobs),
       applicants = List.unmodifiable(applicants);

  final bool loading;
  final bool saving;
  final bool saved;
  final String? busyId;
  final List<JobPostingDto> jobs;
  final List<JobApplicationDto> applicants;
  final Object? error;

  JobPostingDto? jobById(String id) {
    for (final job in jobs) {
      if (job.id == id) return job;
    }
    return null;
  }

  BusinessJobsState copyWith({
    bool? loading,
    bool? saving,
    bool? saved,
    String? busyId,
    bool clearBusy = false,
    List<JobPostingDto>? jobs,
    List<JobApplicationDto>? applicants,
    Object? error,
    bool clearError = false,
  }) => BusinessJobsState(
    loading: loading ?? this.loading,
    saving: saving ?? this.saving,
    saved: saved ?? this.saved,
    busyId: clearBusy ? null : busyId ?? this.busyId,
    jobs: jobs ?? this.jobs,
    applicants: applicants ?? this.applicants,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [
    loading,
    saving,
    saved,
    busyId,
    jobs,
    applicants,
    error,
  ];
}
