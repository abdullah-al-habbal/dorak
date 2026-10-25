import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/booking.event.dart';
import 'package:client_app/src/features/booking/booking.state.dart';

class BookingsFilter extends StatelessWidget {
  const BookingsFilter({super.key, required this.bloc, required this.state});

  final BookingBloc bloc;
  final BookingState state;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.only(
                bottom: DorakDimensions.spacingSmall,
              ),
              child: StatusBanner(
                message: l10n.errorNetwork,
                actionLabel: l10n.actionRetry,
                onAction: () => bloc.add(const BookingsRetryRequested()),
              ),
            ),
          SegmentedButton<String>(
            segments: [
              ButtonSegment(
                value: 'upcoming',
                label: Text(l10n.bookingFilterUpcoming),
              ),
              ButtonSegment(value: 'past', label: Text(l10n.bookingFilterPast)),
            ],
            selected: {state.filter},
            onSelectionChanged: (selection) =>
                bloc.add(BookingsFilterChanged(selection.first)),
          ),
        ],
      ),
    );
  }
}
