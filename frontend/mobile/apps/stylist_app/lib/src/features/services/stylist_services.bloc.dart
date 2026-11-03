import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/services/stylist_service_draft.entity.dart';
import 'package:stylist_app/src/features/services/stylist_services.state.dart';

/// The stylist's own services and prices (`/barber/services`).
class StylistServicesBloc extends Cubit<StylistServicesState> {
  StylistServicesBloc(this._repository) : super(StylistServicesState());

  final StylistOperationsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final services = await _repository.getServices();
      if (isClosed) return;
      emit(state.copyWith(loading: false, services: services));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Creates a service, or updates [id] when given. Returns whether the
  /// backend accepted it; the list is reloaded on success.
  Future<bool> save(StylistServiceDraft draft, {String? id}) async {
    if (state.saving) return false;
    emit(state.copyWith(saving: true, clearError: true));
    try {
      final name = {'en': draft.nameEn, 'ar': draft.nameAr};
      if (id == null) {
        await _repository.createService(
          name: name,
          price: draft.price,
          currencyCode: draft.currencyCode,
          durationMinutes: draft.durationMinutes,
          isAtHome: draft.isAtHome,
          active: draft.isActive,
        );
      } else {
        await _repository.updateService(
          id,
          name: name,
          price: draft.price,
          currencyCode: draft.currencyCode,
          durationMinutes: draft.durationMinutes,
          isAtHome: draft.isAtHome,
          active: draft.isActive,
        );
      }
      return await _finish();
    } catch (error) {
      return _fail(error);
    }
  }

  Future<bool> delete(String id) async {
    if (state.saving) return false;
    emit(state.copyWith(saving: true, clearError: true));
    try {
      await _repository.deleteService(id);
      return await _finish();
    } catch (error) {
      return _fail(error);
    }
  }

  Future<bool> _finish() async {
    if (isClosed) return false;
    emit(state.copyWith(saving: false));
    await load();
    return true;
  }

  bool _fail(Object error) {
    if (!isClosed) emit(state.copyWith(saving: false, error: error));
    return false;
  }
}
