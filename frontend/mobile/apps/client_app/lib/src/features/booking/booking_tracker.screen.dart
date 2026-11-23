import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/booking_refresh.bloc.dart';

class BookingTrackerScreen extends StatefulWidget {
  const BookingTrackerScreen({
    super.key,
    required this.booking,
    required this.repository,
    this.realtime,
    this.clientId,
  });

  final BookingDto booking;
  final BookingRepository repository;
  final RealtimeClient? realtime;
  final String? clientId;

  @override
  State<BookingTrackerScreen> createState() => _BookingTrackerScreenState();
}

class _BookingTrackerScreenState extends State<BookingTrackerScreen> {
  late final Timer _pollingTimer;
  late final BookingRefreshCubit _refreshCubit;

  @override
  void initState() {
    super.initState();
    _refreshCubit = BookingRefreshCubit(
      widget.repository,
      widget.booking,
      realtime: widget.realtime,
      clientId: widget.clientId,
    );
    _pollingTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _refreshCubit.pollIfDisconnected(),
    );
  }

  @override
  void dispose() {
    _pollingTimer.cancel();
    _refreshCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.bookingTrackerTitle)),
      body: BlocBuilder<BookingRefreshCubit, BookingRefreshState>(
        bloc: _refreshCubit,
        builder: (context, state) {
          final (icon, message) = switch (state.booking.status) {
            BookingStatus.pending => (
              Icons.hourglass_empty_outlined,
              l10n.bookingTrackerPending,
            ),
            BookingStatus.confirmed => (
              Icons.check_circle_outline,
              l10n.bookingTrackerConfirmed,
            ),
            BookingStatus.inProgress => (
              Icons.content_cut_outlined,
              l10n.bookingTrackerInProgress,
            ),
            BookingStatus.completed => (
              Icons.task_alt_outlined,
              l10n.bookingTrackerCompleted,
            ),
            BookingStatus.noShow => (
              Icons.person_off_outlined,
              l10n.bookingTrackerNoShow,
            ),
            BookingStatus.cancelled => (
              Icons.cancel_outlined,
              l10n.bookingTrackerCancelled,
            ),
            BookingStatus.unknown => (
              Icons.help_outline,
              l10n.bookingStatusUnknown,
            ),
          };
          return StatusView(
            icon: icon,
            title: l10n.bookingTrackerTitle,
            message: message,
          );
        },
      ),
    );
  }
}
