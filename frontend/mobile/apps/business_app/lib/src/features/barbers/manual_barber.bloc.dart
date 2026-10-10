import 'package:bloc/bloc.dart';
import 'package:core/core.dart';

import 'package:business_app/src/features/barbers/manual_barber.event.dart';
import 'package:business_app/src/features/barbers/manual_barber.state.dart';

class ManualBarberBloc extends Bloc<ManualBarberEvent, ManualBarberState> {
  ManualBarberBloc(this._repository) : super(const ManualBarberState()) {
    on<ManualBarberSubmitted>(_onSubmitted);
  }

  final ManagedBarberRepository _repository;

  Future<void> _onSubmitted(
    ManualBarberSubmitted event,
    Emitter<ManualBarberState> emit,
  ) async {
    if (state.isSubmitting) return;
    emit(state.copyWith(isSubmitting: true, clearError: true));
    try {
      final barber = await _repository.createManualBarber(
        nameEn: event.nameEn,
        nameAr: event.nameAr,
        phone: event.phone,
        chairId: event.chairId,
      );
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, createdBarber: barber));
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }
}
