import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/jobs/stylist_jobs.state.dart';

/// Barber-facing job board only: it never changes an application's status,
/// which belongs to the branch (Task 06).
class StylistJobsBloc extends Cubit<StylistJobsState> {
  StylistJobsBloc(this._repository) : super(StylistJobsState());

  final JobPostingRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final results = await Future.wait([
        _repository.getJobs(),
        _repository.getApplications(),
      ]);
      if (isClosed) return;
      final jobs = results[0] as PaginatedData<JobPostingDto>;
      final applications = results[1] as PaginatedData<JobApplicationDto>;
      emit(
        state.copyWith(
          loading: false,
          jobs: jobs.data,
          applications: applications.data,
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> loadJob(String id) async {
    if (state.jobById(id) != null) return;
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final job = await _repository.getJob(id);
      if (isClosed) return;
      emit(state.copyWith(loading: false, jobs: [...state.jobs, job]));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> apply(String jobId, {String? coverLetter}) async {
    if (state.applyingJobId != null) return;
    emit(state.copyWith(applyingJobId: jobId, clearError: true));
    try {
      final application = await _repository.apply(
        jobId,
        coverLetter: coverLetter,
      );
      if (isClosed) return;
      emit(
        state.copyWith(
          clearApplying: true,
          applications: [...state.applications, application],
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearApplying: true, error: error));
    }
  }
}
