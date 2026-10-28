import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/floor_plan/business_floor_plan.state.dart';
import 'package:business_app/src/features/floor_plan/floor_plan_preset.entity.dart';

class BusinessFloorPlanBloc extends Cubit<BusinessFloorPlanState> {
  BusinessFloorPlanBloc(this._repository)
    : super(const BusinessFloorPlanState());

  final BranchManagementRepository _repository;

  void select(FloorPlanPreset preset) =>
      emit(state.copyWith(preset: preset, saved: false));

  Future<void> save() async {
    if (state.saving) return;
    emit(state.copyWith(saving: true, saved: false, clearError: true));
    try {
      await _repository.updateFloorPlan(preset: state.preset.value);
      if (isClosed) return;
      emit(state.copyWith(saving: false, saved: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }
}
