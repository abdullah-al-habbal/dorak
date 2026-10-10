import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load();
  runApp(const StylistApp());
}

class StylistApp extends StatefulWidget {
  const StylistApp({super.key});
  @override
  State<StylistApp> createState() => _StylistAppState();
}

class _StylistAppState extends State<StylistApp> {
  late final ApiClient _client;
  late final StylistBloc _bloc;
  late final PushNotificationService _pushNotifications;
  @override
  void initState() {
    super.initState();
    _client = ApiClient(
      baseUrl: ConfigProvider.config.apiBaseV1Url,
      tokenProvider: SecureBarberTokenStorage().read,
    );
    _pushNotifications = PushNotificationService(_client);
    unawaited(_pushNotifications.initialize());
    _bloc = StylistBloc(DioStylistOperationsRepository(_client))..load();
  }

  @override
  void dispose() {
    _bloc.close();
    unawaited(_pushNotifications.dispose());
    _client.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: Scaffold(
        appBar: AppBar(
          title: Builder(
            builder: (context) =>
                Text(AppLocalizations.of(context)!.stylistTodayTitle),
          ),
        ),
        body: BlocBuilder<StylistBloc, StylistState>(
          bloc: _bloc,
          builder: (context, state) {
            final l10n = AppLocalizations.of(context)!;
            if (state.loading && state.appointments.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            return RefreshIndicator(
              onRefresh: _bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  SwitchListTile(
                    title: Text(l10n.stylistWorkstationOnline),
                    value: state.online,
                    onChanged: _bloc.setOnline,
                  ),
                  if (state.error != null) Text(l10n.stylistUpdateFailed),
                  const SizedBox(height: 12),
                  Text(
                    l10n.stylistTodayAppointments,
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
                              '${booking.timeSlot.toLocal()} · ${booking.status}',
                            ),
                            Text(
                              booking.services
                                  .map((service) => service.name)
                                  .join(', '),
                            ),
                            const SizedBox(height: 8),
                            _BookingActions(
                              booking: booking,
                              isUpdating: state.updatingBookingId == booking.id,
                              onAction: (action) =>
                                  _bloc.transitionBooking(booking.id, action),
                              l10n: l10n,
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
  final ValueChanged<String> onAction;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final action = switch (booking.status) {
      'pending' => ('accept', l10n.stylistAcceptBooking),
      'confirmed' => ('start', l10n.stylistStartSession),
      'in_progress' => ('complete', l10n.stylistCompleteSession),
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
        if (booking.status == 'in_progress')
          OutlinedButton(
            onPressed: isUpdating ? null : () => onAction('no_show'),
            child: Text(l10n.stylistMarkNoShow),
          ),
      ],
    );
  }
}
