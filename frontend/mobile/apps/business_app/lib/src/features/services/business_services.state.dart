import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessServicesState extends Equatable {
  BusinessServicesState({
    this.loading = false,
    this.saving = false,
    this.brandId,
    List<BusinessServiceDto> services = const [],
    this.error,
  }) : services = List.unmodifiable(services);

  final bool loading;
  final bool saving;
  final String? brandId;
  final List<BusinessServiceDto> services;
  final Object? error;

  BusinessServicesState copyWith({
    bool? loading,
    bool? saving,
    String? brandId,
    List<BusinessServiceDto>? services,
    Object? error,
    bool clearError = false,
  }) => BusinessServicesState(
    loading: loading ?? this.loading,
    saving: saving ?? this.saving,
    brandId: brandId ?? this.brandId,
    services: services ?? this.services,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, saving, brandId, services, error];
}
