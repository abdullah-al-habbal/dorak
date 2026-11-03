import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/services/business_service_draft.entity.dart';
import 'package:business_app/src/features/services/business_services.state.dart';
import 'package:business_app/src/core/locale/app_locales.entity.dart';

class BusinessServicesBloc extends Cubit<BusinessServicesState> {
  BusinessServicesBloc(this._services, this._branch)
    : super(BusinessServicesState());

  final BranchServiceRepository _services;
  final BranchHoursRepository _branch;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final page = await _services.getServices(perPage: _pageSize);
      if (isClosed) return;
      emit(state.copyWith(loading: false, services: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Creates a service, or updates [id] when given. Returns whether the
  /// backend accepted it; the list is reloaded on success.
  Future<bool> save(BusinessServiceDraft draft, {String? id}) async {
    if (state.saving) return false;
    emit(state.copyWith(saving: true, clearError: true));
    try {
      final brandId = await _brandId();
      final name = {
        AppLocales.englishCode: draft.nameEn,
        AppLocales.arabicCode: draft.nameAr,
      };
      if (id == null) {
        await _services.createService(
          brandId: brandId,
          name: name,
          price: draft.price,
          currencyCode: draft.currencyCode,
          durationMinutes: draft.durationMinutes,
          isAtHome: draft.isAtHome,
          isActive: draft.isActive,
        );
      } else {
        await _services.updateService(
          id,
          brandId: brandId,
          name: name,
          price: draft.price,
          currencyCode: draft.currencyCode,
          durationMinutes: draft.durationMinutes,
          isAtHome: draft.isAtHome,
          isActive: draft.isActive,
        );
      }
      if (isClosed) return false;
      emit(state.copyWith(saving: false));
      await load();
      return true;
    } catch (error) {
      if (isClosed) return false;
      emit(state.copyWith(saving: false, error: error));
      return false;
    }
  }

  Future<bool> delete(String id) async {
    if (state.saving) return false;
    emit(state.copyWith(saving: true, clearError: true));
    try {
      await _services.deleteService(id);
      if (isClosed) return false;
      emit(state.copyWith(saving: false));
      await load();
      return true;
    } catch (error) {
      if (isClosed) return false;
      emit(state.copyWith(saving: false, error: error));
      return false;
    }
  }

  Future<String> _brandId() async {
    final cached = state.brandId;
    if (cached != null) return cached;
    final profile = await _branch.getProfile();
    if (!isClosed) emit(state.copyWith(brandId: profile.brandId));
    return profile.brandId;
  }

  static const _pageSize = 50;
}
