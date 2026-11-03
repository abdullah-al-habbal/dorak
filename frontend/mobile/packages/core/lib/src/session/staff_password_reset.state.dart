import 'package:equatable/equatable.dart';

enum StaffPasswordResetStep { email, code, done }

class StaffPasswordResetState extends Equatable {
  const StaffPasswordResetState({
    this.step = StaffPasswordResetStep.email,
    this.email = '',
    this.isSubmitting = false,
    this.error,
  });

  final StaffPasswordResetStep step;
  final String email;
  final bool isSubmitting;
  final Object? error;

  StaffPasswordResetState copyWith({
    StaffPasswordResetStep? step,
    String? email,
    bool? isSubmitting,
    Object? error,
    bool clearError = false,
  }) => StaffPasswordResetState(
    step: step ?? this.step,
    email: email ?? this.email,
    isSubmitting: isSubmitting ?? this.isSubmitting,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [step, email, isSubmitting, error];
}
