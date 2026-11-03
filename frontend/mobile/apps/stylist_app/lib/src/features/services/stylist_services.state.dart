import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistServicesState extends Equatable {
  StylistServicesState({
    this.loading = false,
    this.saving = false,
    List<BarberServiceDto> services = const [],
    this.error,
  }) : services = List.unmodifiable(services);

  final bool loading;
  final bool saving;
  final List<BarberServiceDto> services;
  final Object? error;

  StylistServicesState copyWith({
    bool? loading,
    bool? saving,
    List<BarberServiceDto>? services,
    Object? error,
    bool clearError = false,
  }) => StylistServicesState(
    loading: loading ?? this.loading,
    saving: saving ?? this.saving,
    services: services ?? this.services,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, saving, services, error];
}
