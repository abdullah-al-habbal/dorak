import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';
import 'package:client_app/src/features/booking/widgets/booking_summary.widget.dart';

class ServiceSelectionSection extends StatelessWidget {
  const ServiceSelectionSection({
    super.key,
    required this.bloc,
    required this.state,
    required this.services,
    required this.l10n,
    required this.colors,
  });

  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final List<BookingServiceDto> services;
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l10n.bookingSelectServices, style: DorakTypography.titleLg),
      ...services.map(
        (service) => CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(service.name),
          value: state.selectedServiceIds.contains(service.id),
          activeColor: colors.primary,
          onChanged: (selected) {
            final ids = List<String>.of(state.selectedServiceIds);
            if (selected == true) {
              ids.add(service.id);
            } else {
              ids.remove(service.id);
            }
            bloc.add(BranchDetailServicesChanged(ids));
          },
        ),
      ),
      const SizedBox(height: DorakDimensions.spacingMedium),
      BookingSummary(state: state),
      const SizedBox(height: DorakDimensions.spacingMedium),
    ],
  );
}
