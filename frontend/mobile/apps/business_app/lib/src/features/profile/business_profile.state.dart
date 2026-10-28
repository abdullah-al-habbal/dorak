import 'package:equatable/equatable.dart';

class BusinessProfileState extends Equatable {
  const BusinessProfileState({
    this.saving = false,
    this.saved = false,
    this.error,
  });

  final bool saving;
  final bool saved;
  final Object? error;

  BusinessProfileState copyWith({
    bool? saving,
    bool? saved,
    Object? error,
    bool clearError = false,
  }) => BusinessProfileState(
    saving: saving ?? this.saving,
    saved: saved ?? this.saved,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [saving, saved, error];
}
