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
                if (state.profile != null)
                  _ProfileServicesSection(profile: state.profile!, l10n: strings),
                if (state.error != null) Text(strings.stylistUpdateFailed),
                const SizedBox(height: 12),
                Text(
                  strings.stylistTodayAppointments,
                  style: DorakTypography.titleLg,
                ),
                ...state.appointments.map(
                  (booking) => _AppointmentCard(
                    booking: booking,
                    isUpdating: state.updatingBookingId == booking.id,
                    onAction: (action) =>
                        bloc.transitionBooking(booking.id, action),
                    l10n: strings,
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

class _ProfileServicesSection extends StatelessWidget {
  const _ProfileServicesSection({required this.profile, required this.l10n});

  final BarberProfileDto profile;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(profile.name),
        subtitle: Text(profile.email),
      ),
      Text(l10n.stylistServicesTitle, style: DorakTypography.titleLg),
      if (profile.services.isEmpty) Text(l10n.stylistNoServicesMessage),
      ...profile.services.where((service) => service.active).map(
        (service) => ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(service.name),
          subtitle: Text(
            [
              if (service.duration != null)
                l10n.serviceDurationLabel(service.duration!),
              if (service.atHome) l10n.serviceAtHomeLabel,
            ].join(' · '),
          ),
        ),
      ),
    ],
  );
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({
    required this.booking,
    required this.isUpdating,
    required this.onAction,
    required this.l10n,
  });

  final BookingDto booking;
  final bool isUpdating;
  final ValueChanged<BarberBookingAction> onAction;
  final AppLocalizations l10n;

  String get _statusLabel => switch (booking.status) {
    BookingStatus.pending => l10n.bookingStatusPending,
    BookingStatus.confirmed => l10n.bookingStatusConfirmed,
    BookingStatus.inProgress => l10n.bookingStatusInProgress,
    BookingStatus.completed => l10n.bookingStatusCompleted,
    BookingStatus.canceled => l10n.bookingStatusCanceled,
    BookingStatus.noShow => l10n.bookingStatusNoShow,
  };

  @override
  Widget build(BuildContext context) {
    final materialL10n = MaterialLocalizations.of(context);
    final timeSlot = booking.timeSlot.toLocal();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.stylistAppointmentDateTime(
                materialL10n.formatMediumDate(timeSlot),
                materialL10n.formatTimeOfDay(TimeOfDay.fromDateTime(timeSlot)),
              ),
            ),
            Text(
              '$_statusLabel · ${booking.services.map((service) => service.name).join(', ')}',
            ),
            const SizedBox(height: 8),
            _BookingActions(
              booking: booking,
              isUpdating: isUpdating,
              onAction: onAction,
              l10n: l10n,
            ),
          ],
        ),
      ),
    );
  }
}

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
