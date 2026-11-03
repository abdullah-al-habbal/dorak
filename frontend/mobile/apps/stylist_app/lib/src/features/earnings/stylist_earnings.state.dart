import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

import 'package:stylist_app/src/features/earnings/earnings_range.entity.dart';

class StylistEarningsState extends Equatable {
  const StylistEarningsState({
    this.loading = false,
    this.range = EarningsRange.month,
    this.earnings,
    this.error,
  });

  final bool loading;
  final EarningsRange range;
  final EarningsDto? earnings;
  final Object? error;

  StylistEarningsState copyWith({
    bool? loading,
    EarningsRange? range,
    EarningsDto? earnings,
    Object? error,
    bool clearError = false,
  }) => StylistEarningsState(
    loading: loading ?? this.loading,
    range: range ?? this.range,
    earnings: earnings ?? this.earnings,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, range, earnings, error];
}
