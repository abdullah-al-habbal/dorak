import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/reviews/business_reviews.state.dart';

class BusinessReviewsBloc extends Cubit<BusinessReviewsState> {
  BusinessReviewsBloc(this._repository) : super(BusinessReviewsState());

  final BranchManagementRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final page = await _repository.getReviews();
      if (isClosed) return;
      emit(state.copyWith(loading: false, reviews: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }
}
