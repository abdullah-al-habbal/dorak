import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.state.dart';

class StylistScreen extends StatelessWidget {
  const StylistScreen({
    super.key,
    required this.bloc,
    required this.onLocaleToggle,
    required this.onLogout,
  });

  final StylistBloc bloc;
  final VoidCallback onLocaleToggle;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.stylistTodayTitle),
        actions: [
          IconButton(
            tooltip: l10n.staffLogOut,
            onPressed: onLogout,
            icon: const Icon(Icons.logout),
          ),
          TextButton(
            onPressed: onLocaleToggle,
            child: Text(
              Localizations.localeOf(context).languageCode == 'en'
                  ? l10n.localeArabic
                  : l10n.localeEnglish,
            ),
          ),
        ],
      ),
      body: BlocBuilder<StylistBloc, StylistState>(
        bloc: bloc,
        builder: (context, state) {
          final strings = AppLocalizations.of(context)!;
          if (state.loading && state.appointments.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          return RefreshIndicator(
            onRefresh: bloc.load,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                SwitchListTile(
                  title: Text(strings.stylistWorkstationOnline),
                  value: state.online,
                  onChanged: bloc.setOnline,
                ),
                if (state.profile != null) ...[
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(state.profile!.name),
                    subtitle: Text(state.profile!.email),
                  ),
                  Text(
                    strings.stylistServicesTitle,
                    style: DorakTypography.titleLg,
                  ),
                  if (state.profile!.services.isEmpty)
                    Text(strings.stylistNoServicesMessage),
                  ...state.profile!.services
                      .where((service) => service.active)
                      .map(
                        (service) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(service.name),
                          subtitle: Text(
                            [
                              if (service.duration != null)
                                strings.serviceDurationLabel(service.duration!),
                              if (service.atHome) strings.serviceAtHomeLabel,
                            ].join(' · '),
                          ),
                        ),
                      ),
                ],
                if (state.error != null) Text(strings.stylistUpdateFailed),
                const SizedBox(height: 12),
                Text(
                  strings.stylistTodayAppointments,
                  style: DorakTypography.titleLg,
                ),
                ...state.appointments.map(
                  (booking) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            strings.stylistAppointmentDateTime(
                              MaterialLocalizations.of(
                                context,
                              ).formatMediumDate(booking.timeSlot.toLocal()),
                              MaterialLocalizations.of(context).formatTimeOfDay(
                                TimeOfDay.fromDateTime(
                                  booking.timeSlot.toLocal(),
                                ),
                              ),
                            ),
                          ),
                          Text(
                            '${_bookingStatus(strings, booking.status)} · ${booking.services.map((service) => service.name).join(', ')}',
                          ),
                          const SizedBox(height: 8),
                          _BookingActions(
                            booking: booking,
                            isUpdating: state.updatingBookingId == booking.id,
                            onAction: (action) =>
                                bloc.transitionBooking(booking.id, action),
                            l10n: strings,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

String _bookingStatus(AppLocalizations l10n, BookingStatus status) =>
    switch (status) {
      BookingStatus.pending => l10n.bookingStatusPending,
      BookingStatus.confirmed => l10n.bookingStatusConfirmed,
      BookingStatus.inProgress => l10n.bookingStatusInProgress,
      BookingStatus.completed => l10n.bookingStatusCompleted,
      BookingStatus.canceled => l10n.bookingStatusCanceled,
      BookingStatus.noShow => l10n.bookingStatusNoShow,
    };

class _BookingActions extends StatelessWidget {
  const _BookingActions({
    required this.booking,
    required this.isUpdating,
    required this.onAction,
    required this.l10n,
  });

  final BookingDto booking;
  final bool isUpdating;
  final ValueChanged<BarberBookingAction> onAction;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final action = switch (booking.status) {
      BookingStatus.pending => (
        BarberBookingAction.accept,
        l10n.stylistAcceptBooking,
      ),
      BookingStatus.confirmed => (
        BarberBookingAction.start,
        l10n.stylistStartSession,
      ),
      BookingStatus.inProgress => (
        BarberBookingAction.complete,
        l10n.stylistCompleteSession,
      ),
      _ => null,
    };
    if (action == null) return const SizedBox.shrink();
    return Wrap(
      spacing: 8,
      children: [
        FilledButton(
          onPressed: isUpdating ? null : () => onAction(action.$1),
          child: Text(action.$2),
        ),
        if (booking.status == BookingStatus.inProgress)
          OutlinedButton(
            onPressed: isUpdating
                ? null
                : () => onAction(BarberBookingAction.noShow),
            child: Text(l10n.stylistMarkNoShow),
          ),
      ],
    );
  }
}
