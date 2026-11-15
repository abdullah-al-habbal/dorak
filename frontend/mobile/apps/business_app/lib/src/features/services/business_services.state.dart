import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessServicesState extends Equatable {
  BusinessServicesState({
    this.loading = false,
    List<BusinessServiceDto> services = const [],
    this.error,
  }) : services = List.unmodifiable(services);

  final bool loading;
  final List<BusinessServiceDto> services;
  final Object? error;

  BusinessServicesState copyWith({
    bool? loading,
    List<BusinessServiceDto>? services,
    Object? error,
    bool clearError = false,
  }) => BusinessServicesState(
    loading: loading ?? this.loading,
    services: services ?? this.services,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, services, error];
}
