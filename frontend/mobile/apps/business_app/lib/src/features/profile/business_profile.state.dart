import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessProfileState extends Equatable {
  const BusinessProfileState({
    this.saving = false,
    this.saved = false,
    this.texts,
    this.error,
  });

  final bool saving;
  final bool saved;

  /// The branch's stored texts once loaded; `null` until then, so a failed load never clears them on save.
  final BranchProfileTextsDto? texts;
  final Object? error;

  BusinessProfileState copyWith({
    bool? saving,
    bool? saved,
    BranchProfileTextsDto? texts,
    Object? error,
    bool clearError = false,
  }) => BusinessProfileState(
    saving: saving ?? this.saving,
    saved: saved ?? this.saved,
    texts: texts ?? this.texts,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [saving, saved, texts, error];
}
