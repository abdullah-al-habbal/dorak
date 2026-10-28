import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class SavedFiltersState extends Equatable {
  SavedFiltersState({
    List<SavedFilterDto> filters = const [],
    this.isLoading = false,
    this.isSaving = false,
    this.error,
  }) : filters = List.unmodifiable(filters);

  final List<SavedFilterDto> filters;
  final bool isLoading;
  final bool isSaving;
  final Object? error;

  SavedFiltersState copyWith({
    List<SavedFilterDto>? filters,
    bool? isLoading,
    bool? isSaving,
    Object? error,
    bool clearError = false,
  }) {
    return SavedFiltersState(
      filters: filters ?? this.filters,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: clearError ? null : error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [filters, isLoading, isSaving, error];
}
