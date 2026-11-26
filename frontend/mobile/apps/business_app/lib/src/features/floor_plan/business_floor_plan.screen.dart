import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.state.dart';
import 'package:business_app/src/features/floor_plan/floor_plan_preset.entity.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';

class BusinessFloorPlanScreen extends StatelessWidget {
  const BusinessFloorPlanScreen({super.key, required this.bloc});

  final BusinessFloorPlanBloc bloc;

  String _label(AppLocalizations l10n, FloorPlanPreset preset) =>
      switch (preset) {
        FloorPlanPreset.standard => l10n.businessFloorPlanPresetStandard,
        FloorPlanPreset.compact => l10n.businessFloorPlanPresetCompact,
        FloorPlanPreset.unisexZoned => l10n.businessFloorPlanPresetUnisexZoned,
      };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.businessFloorPlanTitle)),
      body: BlocBuilder<BusinessFloorPlanBloc, BusinessFloorPlanState>(
        bloc: bloc,
        builder: (context, state) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            RadioGroup<FloorPlanPreset>(
              groupValue: state.preset,
              onChanged: (value) {
                if (value != null) bloc.select(value);
              },
              child: Column(
                children: [
                  for (final preset in FloorPlanPreset.values)
                    RadioListTile<FloorPlanPreset>(
                      value: preset,
                      title: Text(_label(l10n, preset)),
                    ),
                ],
              ),
            ),
            if (state.error != null) FeatureError(error: state.error!),
            if (state.saved) Text(l10n.commonSaved),
            FilledButton(
              onPressed: state.saving ? null : bloc.save,
              child: Text(l10n.businessSave),
            ),
          ],
        ),
      ),
    );
  }
}
