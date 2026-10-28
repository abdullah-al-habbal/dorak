import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BranchReviewsBloc extends Cubit<Paged<ReviewDto>> {
  BranchReviewsBloc(this._repository) : super(const Paged.initial());

  final ReviewRepository _repository;
  String? _branchId;

  Future<void> load(String branchId) async {
    if (state.isBusy) return;
    _branchId = branchId;
    emit(state.loadingFirst());
    try {
      final page = await _repository.getBranchReviews(branchId);
      if (!isClosed) emit(state.succeeded(page));
    } catch (error) {
      if (!isClosed) emit(state.failed(error));
    }
  }

  Future<void> loadMore() async {
    final branchId = _branchId;
    if (branchId == null || !state.hasMore || state.isBusy) return;
    emit(state.loadingMore());
    try {
      final page = await _repository.getBranchReviews(
        branchId,
        page: state.meta.currentPage + 1,
      );
      if (!isClosed) emit(state.succeeded(page));
    } catch (error) {
      if (!isClosed) emit(state.failed(error));
    }
  }

  Future<void> retry() {
    final branchId = _branchId;
    if (branchId == null) return Future.value();
    if (state.hasFailedMore) return loadMore();
    return load(branchId);
  }
}
