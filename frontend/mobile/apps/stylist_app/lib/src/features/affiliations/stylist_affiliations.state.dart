import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistAffiliationsState extends Equatable {
  StylistAffiliationsState({
    this.loading = false,
    this.busyId,
    List<BarberAffiliationDto> affiliations = const [],
    this.error,
  }) : affiliations = List.unmodifiable(affiliations);

  final bool loading;
  final String? busyId;
  final List<BarberAffiliationDto> affiliations;
  final Object? error;

  StylistAffiliationsState copyWith({
    bool? loading,
    String? busyId,
    bool clearBusy = false,
    List<BarberAffiliationDto>? affiliations,
    Object? error,
    bool clearError = false,
  }) => StylistAffiliationsState(
    loading: loading ?? this.loading,
    busyId: clearBusy ? null : busyId ?? this.busyId,
    affiliations: affiliations ?? this.affiliations,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, busyId, affiliations, error];
}
