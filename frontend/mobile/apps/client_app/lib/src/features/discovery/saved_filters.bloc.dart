import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/discovery/saved_filters.state.dart';

class SavedFiltersCubit extends Cubit<SavedFiltersState> {
  SavedFiltersCubit(this._repository) : super(SavedFiltersState());

  final ClientInteractionRepository _repository;

  Future<void> load() async {
    if (state.isLoading) return;
    emit(state.copyWith(isLoading: true, clearError: true));
    try {
      final filters = await _repository.getSavedFilters();
      if (!isClosed) emit(state.copyWith(filters: filters, isLoading: false));
    } catch (error) {
      if (!isClosed) emit(state.copyWith(isLoading: false, error: error));
    }
  }

  Future<void> save(String name, Map<String, dynamic> config) async {
    final trimmed = name.trim();
    if (trimmed.isEmpty || state.isSaving) return;
    emit(state.copyWith(isSaving: true, clearError: true));
    try {
      final saved = await _repository.saveFilter(
        name: trimmed,
        filterConfig: config,
      );
      if (isClosed) return;
      emit(state.copyWith(filters: [...state.filters, saved], isSaving: false));
    } catch (error) {
      if (!isClosed) emit(state.copyWith(isSaving: false, error: error));
    }
  }

  Future<void> delete(String id) async {
    emit(state.copyWith(clearError: true));
    try {
      await _repository.deleteSavedFilter(id);
      if (isClosed) return;
      emit(
        state.copyWith(
          filters: state.filters.where((filter) => filter.id != id).toList(),
        ),
      );
    } catch (error) {
      if (!isClosed) emit(state.copyWith(error: error));
    }
  }
}
