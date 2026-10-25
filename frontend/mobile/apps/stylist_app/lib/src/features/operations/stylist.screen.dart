import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.state.dart';
import 'package:stylist_app/src/features/operations/widgets/appointment_card.widget.dart';
import 'package:stylist_app/src/features/operations/widgets/profile_services_section.widget.dart';

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
                  ProfileServicesSection(profile: state.profile!, l10n: strings),
                if (state.error != null) Text(strings.stylistUpdateFailed),
                const SizedBox(height: 12),
                Text(
                  strings.stylistTodayAppointments,
                  style: DorakTypography.titleLg,
                ),
                ...state.appointments.map(
                  (booking) => AppointmentCard(
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
