import 'package:equatable/equatable.dart';

class DeleteAccountState extends Equatable {
  const DeleteAccountState({
    this.isSubmitting = false,
    this.succeeded = false,
    this.error,
  });

  final bool isSubmitting;
  final bool succeeded;
  final Object? error;

  DeleteAccountState copyWith({
    bool? isSubmitting,
    bool? succeeded,
    Object? error,
    bool clearError = false,
  }) => DeleteAccountState(
    isSubmitting: isSubmitting ?? this.isSubmitting,
    succeeded: succeeded ?? this.succeeded,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [isSubmitting, succeeded, error];
}
