import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/services/business_services.state.dart';

class BusinessServicesBloc extends Cubit<BusinessServicesState> {
  BusinessServicesBloc(this._services) : super(BusinessServicesState());

  final BranchServiceRepository _services;

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

  static const _pageSize = 50;
}
