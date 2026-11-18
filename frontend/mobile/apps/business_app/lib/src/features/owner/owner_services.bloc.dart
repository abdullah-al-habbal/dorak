import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/owner/owner_services.state.dart';

/// Brand services through `/owner/services` (decision C: the owner manages them).
class OwnerServicesCubit extends Cubit<OwnerServicesState> {
  OwnerServicesCubit(this._services) : super(OwnerServicesState());

  final BranchServiceRepository _services;

  static const _pageSize = 50;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true, saved: false));
    try {
      final page = await _services.getServices(perPage: _pageSize);
      if (isClosed) return;
      emit(state.copyWith(loading: false, services: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> save({
    String? id,
    required String brandId,
    required String nameEn,
    required String nameAr,
    required double price,
    required String currencyCode,
    required int durationMinutes,
  }) async {
    if (state.isSaving) return;
    emit(state.copyWith(isSaving: true, saved: false, clearError: true));
    final localized = {'en': nameEn, 'ar': nameAr};
    try {
      if (id == null) {
        await _services.createService(
          brandId: brandId,
          name: localized,
          price: price,
          currencyCode: currencyCode,
          durationMinutes: durationMinutes,
        );
      } else {
        await _services.updateService(
          id,
          brandId: brandId,
          name: localized,
          price: price,
          currencyCode: currencyCode,
          durationMinutes: durationMinutes,
        );
      }
      if (isClosed) return;
      emit(state.copyWith(isSaving: false, saved: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(isSaving: false, error: error));
    }
  }

  Future<void> delete(String id) async {
    emit(state.copyWith(clearError: true));
    try {
      await _services.deleteService(id);
      await load();
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(error: error));
    }
  }
}
