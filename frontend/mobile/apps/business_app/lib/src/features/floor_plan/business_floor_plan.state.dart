import 'package:equatable/equatable.dart';

import 'package:business_app/src/features/floor_plan/floor_plan_preset.entity.dart';

class BusinessFloorPlanState extends Equatable {
  const BusinessFloorPlanState({
    this.preset = FloorPlanPreset.standard,
    this.saving = false,
    this.saved = false,
    this.error,
  });

  final FloorPlanPreset preset;
  final bool saving;
  final bool saved;
  final Object? error;

  BusinessFloorPlanState copyWith({
    FloorPlanPreset? preset,
    bool? saving,
    bool? saved,
    Object? error,
    bool clearError = false,
  }) => BusinessFloorPlanState(
    preset: preset ?? this.preset,
    saving: saving ?? this.saving,
    saved: saved ?? this.saved,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [preset, saving, saved, error];
}
