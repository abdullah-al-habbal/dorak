import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/earnings/stylist_earnings.state.dart';
import 'package:stylist_app/src/features/earnings/earnings_range.entity.dart';

class StylistEarningsBloc extends Cubit<StylistEarningsState> {
  StylistEarningsBloc(this._repository, {DateTime Function()? clock})
    : _clock = clock ?? DateTime.now,
      super(const StylistEarningsState());

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
