import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class OwnerServicesState extends Equatable {
  OwnerServicesState({
    this.loading = false,
    List<BusinessServiceDto> services = const [],
    this.error,
    this.isSaving = false,
    this.saved = false,
  }) : services = List.unmodifiable(services);

  final bool loading;
  final List<BusinessServiceDto> services;
  final Object? error;
  final bool isSaving;
  final bool saved;

  OwnerServicesState copyWith({
    bool? loading,
    List<BusinessServiceDto>? services,
    Object? error,
    bool? isSaving,
    bool? saved,
    bool clearError = false,
  }) => OwnerServicesState(
    loading: loading ?? this.loading,
    services: services ?? this.services,
    error: clearError ? null : error ?? this.error,
    isSaving: isSaving ?? this.isSaving,
    saved: saved ?? this.saved,
  );

  @override
  List<Object?> get props => [loading, services, error, isSaving, saved];
}
