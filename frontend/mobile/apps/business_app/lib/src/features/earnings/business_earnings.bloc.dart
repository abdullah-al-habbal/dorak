import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/earnings/business_earnings.state.dart';
import 'package:business_app/src/features/earnings/earnings_range.entity.dart';

class BusinessEarningsBloc extends Cubit<BusinessEarningsState> {
  BusinessEarningsBloc(this._repository, {DateTime Function()? clock})
    : _clock = clock ?? DateTime.now,
      super(const BusinessEarningsState());

  final EarningsRepository _repository;
  final DateTime Function() _clock;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final now = _clock();
      final earnings = state.range == EarningsRange.month
          ? await _repository.getEarnings(
              from: DateTime(now.year, now.month),
              to: now,
            )
          : await _repository.getEarnings();
      if (isClosed) return;
      emit(state.copyWith(loading: false, earnings: earnings));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> selectRange(EarningsRange range) async {
    if (range == state.range && state.earnings != null) return;
    emit(state.copyWith(range: range));
    await load();
  }
}
