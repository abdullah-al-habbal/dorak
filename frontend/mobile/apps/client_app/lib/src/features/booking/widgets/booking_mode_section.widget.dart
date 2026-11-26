import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';
import 'package:client_app/src/features/booking/widgets/at_home_booking_fields.widget.dart';
import 'package:client_app/src/features/booking/widgets/chair_services.widget.dart';
import 'package:client_app/src/features/booking/widgets/floor_plan_grid.widget.dart';

class BookingModeSection extends StatelessWidget {
  const BookingModeSection({
    super.key,
    required this.bloc,
    required this.state,
    required this.l10n,
    required this.colors,
  });

  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final AppLocalizations l10n;
  final DorakColors colors;

  FloorChairDto? get _selectedChair {
    final id = state.selectedChairId;
    if (id == null) return null;
    for (final chair in state.plan?.chairs ?? const <FloorChairDto>[]) {
      if (chair.id == id) return chair;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) => Column(
    children: [
      SwitchListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(l10n.bookingAtHomeToggle),
        value: state.isAtHomeBooking,
        activeThumbColor: colors.primary,
        onChanged: (value) => bloc.add(BranchDetailBookingModeChanged(value)),
      ),
      const SizedBox(height: DorakDimensions.spacingSmall),
      if (state.isAtHomeBooking) ...[
        AtHomeBookingFields(bloc: bloc, state: state),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ] else if (state.plan != null) ...[
        FloorPlanGrid(
          chairs: state.plan!.chairs,
          zones: state.plan!.floorPlan?.zones ?? const [],
          selectedChairId: state.selectedChairId,
          onChairSelected: (id) => bloc.add(BranchDetailChairSelected(id)),
          availableLabel: l10n.branchAvailableLabel,
          occupiedLabel: l10n.branchOccupiedLabel,
        ),
        if (_selectedChair case final chair?) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          ChairServices(chair: chair, plan: state.plan!),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
      ] else if (state.planError != null) ...[
        StatusBanner(
          message: ErrorFeedback.loadMessage(l10n, state.planError),
          actionLabel: l10n.actionRetry,
          onAction: () => bloc.add(const BranchDetailRetried()),
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ],
    ],
  );
}
