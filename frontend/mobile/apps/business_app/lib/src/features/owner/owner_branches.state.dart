import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class OwnerBranchesState extends Equatable {
  OwnerBranchesState({
    this.loading = false,
    List<OwnerBranchDto> branches = const [],
    this.error,
    this.isSaving = false,
    this.saved = false,
  }) : branches = List.unmodifiable(branches);

  final bool loading;
  final List<OwnerBranchDto> branches;
  final Object? error;
  final bool isSaving;
  final bool saved;

  OwnerBranchesState copyWith({
    bool? loading,
    List<OwnerBranchDto>? branches,
    Object? error,
    bool? isSaving,
    bool? saved,
    bool clearError = false,
  }) => OwnerBranchesState(
    loading: loading ?? this.loading,
    branches: branches ?? this.branches,
    error: clearError ? null : error ?? this.error,
    isSaving: isSaving ?? this.isSaving,
    saved: saved ?? this.saved,
  );

  @override
  List<Object?> get props => [loading, branches, error, isSaving, saved];
}
