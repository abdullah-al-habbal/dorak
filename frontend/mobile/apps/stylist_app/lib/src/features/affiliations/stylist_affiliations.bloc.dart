import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/affiliations/stylist_affiliations.state.dart';

class StylistAffiliationsBloc extends Cubit<StylistAffiliationsState> {
  StylistAffiliationsBloc(this._repository, this._barberId)
    : super(StylistAffiliationsState());

  final AffiliationRepository _repository;
  final String? Function() _barberId;

  Future<void> load() async {
    final barberId = _barberId();
    if (barberId == null) return;
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final affiliations = await _repository.getBarberAffiliations(barberId);
      if (isClosed) return;
      emit(state.copyWith(loading: false, affiliations: affiliations));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> accept(String id) => _decide(id, _repository.acceptAffiliation);

  Future<void> reject(String id) => _decide(id, _repository.rejectAffiliation);

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
