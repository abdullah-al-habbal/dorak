import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistProfileState extends Equatable {
  const StylistProfileState({
    this.loading = false,
    this.saving = false,
    this.saved = false,
    this.profile,
    this.travelRadiusKm = 0,
    this.error,
  });

  final bool loading;
  final bool saving;
  final bool saved;
  final BarberProfileDto? profile;
  final double travelRadiusKm;
  final Object? error;

  StylistProfileState copyWith({
    bool? loading,
    bool? saving,
    bool? saved,
    BarberProfileDto? profile,
    double? travelRadiusKm,
    Object? error,
    bool clearError = false,
  }) => StylistProfileState(
    loading: loading ?? this.loading,
    saving: saving ?? this.saving,
    saved: saved ?? this.saved,
    profile: profile ?? this.profile,
    travelRadiusKm: travelRadiusKm ?? this.travelRadiusKm,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [
    loading,
    saving,
    saved,
    profile,
    travelRadiusKm,
    error,
  ];
}
