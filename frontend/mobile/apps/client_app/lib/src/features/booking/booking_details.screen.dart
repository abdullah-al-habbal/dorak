import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/booking_refresh.bloc.dart';
import 'package:client_app/src/features/booking/widgets/booking_details_body.widget.dart';

class BookingDetailsScreen extends StatefulWidget {
  const BookingDetailsScreen({
    super.key,
    required this.booking,
    required this.repository,
  });

  final BookingDto booking;
  final BookingRepository repository;

  @override
  State<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends State<BookingDetailsScreen> {
  late final BookingRefreshCubit _refreshCubit;

  @override
  void initState() {
    super.initState();
    _refreshCubit = BookingRefreshCubit(widget.repository, widget.booking);
    _refreshCubit.refresh();
  }

  @override
  void dispose() {
    _refreshCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context)!.viewDetails)),
      body: BlocBuilder<BookingRefreshCubit, BookingRefreshState>(
        bloc: _refreshCubit,
        builder: (context, state) => RefreshIndicator(
          onRefresh: _refreshCubit.refresh,
          child: BookingDetailsBody(
            booking: state.booking,
            serviceLine: (service, localeCode) => _serviceLine(
              service,
              localeCode,
              AppLocalizations.of(context)!,
            ),
            statusLabel: _statusLabel,
          ),
        ),
      ),
    );
  }

  String _serviceLine(
    BookingServiceDto service,
    String localeCode,
    AppLocalizations l10n,
  ) {
    final details = [
      if (service.durationMinutes != null)
        l10n.serviceDurationLabel(service.durationMinutes!),
      if (service.priceAmountMinor != null)
        LocaleFormatters.decimal(
          MinorUnits.toMajor(service.priceAmountMinor!),
          localeCode,
        ),
    ];
    return details.isEmpty
        ? service.name
        : '${service.name} · ${details.join(' · ')}';
  }

  String _statusLabel(AppLocalizations l10n, BookingStatus status) {
    return switch (status) {
      BookingStatus.confirmed => l10n.bookingStatusConfirmed,
      BookingStatus.pending => l10n.bookingStatusPending,
      BookingStatus.inProgress => l10n.bookingStatusInProgress,
      BookingStatus.completed => l10n.bookingStatusCompleted,
      BookingStatus.noShow => l10n.bookingStatusNoShow,
      BookingStatus.canceled => l10n.bookingStatusCanceled,
    };
  }
}
