import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/jobs/application_decision.entity.dart';
import 'package:business_app/src/features/jobs/business_jobs.state.dart';

class BusinessJobsBloc extends Cubit<BusinessJobsState> {
  BusinessJobsBloc(this._repository) : super(BusinessJobsState());

  final JobPostingRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, saved: false, clearError: true));
    try {
      final page = await _repository.getBranchJobPostings();
      if (isClosed) return;
      emit(state.copyWith(loading: false, jobs: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Creates a posting, or updates [id] when given; [values] is the request
  /// body (`title`, `description`, `location`, `type`).
  Future<void> save(Map<String, dynamic> values, {String? id}) async {
    if (state.saving) return;
    emit(state.copyWith(saving: true, saved: false, clearError: true));
    try {
      final job = await _repository.saveBranchJobPosting(values, id: id);
      if (isClosed) return;
      final exists = state.jobs.any((existing) => existing.id == job.id);
      emit(
        state.copyWith(
          saving: false,
          saved: true,
          jobs: exists
              ? [for (final item in state.jobs) item.id == job.id ? job : item]
              : [job, ...state.jobs],
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }

  Future<void> delete(String id) async {
    if (state.busyId != null) return;
    emit(state.copyWith(busyId: id, clearError: true));
    try {
      await _repository.deleteBranchJobPosting(id);
      if (isClosed) return;
      emit(
        state.copyWith(
          clearBusy: true,
          jobs: state.jobs.where((job) => job.id != id).toList(),
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearBusy: true, error: error));
    }
  }

  Future<void> loadApplicants(String jobId) async {
    emit(state.copyWith(loading: true, applicants: const [], clearError: true));
    await _markSeen(jobId);
    if (isClosed) return;
    try {
      final page = await _repository.getBranchApplications(jobId);
      if (isClosed) return;
      emit(state.copyWith(loading: false, applicants: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Best-effort: the list is read-only, so a failed mark-seen never blocks it.
  Future<void> _markSeen(String jobId) async {
    try {
      await _repository.markBranchApplicationsSeen(jobId);
    } catch (_) {
      // Intentionally ignored: marking seen is informational.
    }
  }

  Future<void> decide(
    String jobId,
    String applicationId,
    ApplicationDecision decision,
  ) async {
    if (state.busyId != null) return;
    emit(state.copyWith(busyId: applicationId, clearError: true));
    try {
      final updated = await _repository.updateBranchApplicationStatus(
        jobId,
        applicationId,
        decision.value,
      );
      if (isClosed) return;
      emit(
        state.copyWith(
          clearBusy: true,
          applicants: [
            for (final item in state.applicants)
              item.id == applicationId ? updated : item,
          ],
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearBusy: true, error: error));
    }
  }
}
