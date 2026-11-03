import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

import 'package:business_app/src/features/earnings/earnings_range.entity.dart';

class BusinessEarningsState extends Equatable {
  const BusinessEarningsState({
    this.loading = false,
    this.range = EarningsRange.month,
    this.earnings,
    this.error,
  });

  final bool loading;
  final EarningsRange range;
  final EarningsDto? earnings;
  final Object? error;

  BusinessEarningsState copyWith({
    bool? loading,
    EarningsRange? range,
    EarningsDto? earnings,
    Object? error,
    bool clearError = false,
  }) => BusinessEarningsState(
    loading: loading ?? this.loading,
    range: range ?? this.range,
    earnings: earnings ?? this.earnings,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, range, earnings, error];
}
