import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class ManualBarberState extends Equatable {
  const ManualBarberState({
    this.isSubmitting = false,
    this.createdBarber,
    this.error,
  });

  final bool isSubmitting;
  final ManagedBarberDto? createdBarber;
  final Object? error;

  ManualBarberState copyWith({
    bool? isSubmitting,
    ManagedBarberDto? createdBarber,
    Object? error,
    bool clearError = false,
  }) {
    return ManualBarberState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      createdBarber: createdBarber ?? this.createdBarber,
      error: clearError ? null : error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [isSubmitting, createdBarber, error];
}
