import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/affiliations/business_affiliations.state.dart';

class BusinessAffiliationsBloc extends Cubit<BusinessAffiliationsState> {
  BusinessAffiliationsBloc(this._repository)
    : super(BusinessAffiliationsState());

  final AffiliationRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final affiliations = await _repository.getBranchAffiliations();
      if (isClosed) return;
      emit(state.copyWith(loading: false, affiliations: affiliations));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> accept(String id) =>
      _decide(id, _repository.acceptBranchAffiliation);

  Future<void> reject(String id) =>
      _decide(id, _repository.rejectBranchAffiliation);

  Future<void> _decide(
    String id,
    Future<BarberAffiliationDto> Function(String id) decision,
  ) async {
    if (state.busyId != null) return;
    emit(state.copyWith(busyId: id, clearError: true));
    try {
      final updated = await decision(id);
      if (isClosed) return;
      emit(
        state.copyWith(
          clearBusy: true,
          affiliations: [
            for (final item in state.affiliations)
              item.id == id ? updated : item,
          ],
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearBusy: true, error: error));
    }
  }
}
