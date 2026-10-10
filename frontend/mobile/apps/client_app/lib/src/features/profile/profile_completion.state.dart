import 'package:equatable/equatable.dart';

class ProfileCompletionState extends Equatable {
  const ProfileCompletionState({
    this.isSubmitting = false,
    this.completed = false,
    this.error,
  });

  final bool isSubmitting;
  final bool completed;
  final Object? error;

  ProfileCompletionState copyWith({
    bool? isSubmitting,
    bool? completed,
    Object? error,
    bool clearError = false,
  }) {
    return ProfileCompletionState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      completed: completed ?? this.completed,
      error: clearError ? null : error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [isSubmitting, completed, error];
}
