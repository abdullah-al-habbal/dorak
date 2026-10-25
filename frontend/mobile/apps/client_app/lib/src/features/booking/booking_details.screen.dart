import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/widgets/booking_detail_line.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_details_section.widget.dart';
import 'package:client_app/src/features/booking/booking_refresh.bloc.dart';

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
          child: _BookingDetailsBody(
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
      if (service.duration != null)
        l10n.serviceDurationLabel(service.duration!),
      if (service.price != null)
        LocaleFormatters.decimal(service.price!, localeCode),
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

class _BookingDetailsBody extends StatelessWidget {
  const _BookingDetailsBody({
    required this.booking,
    required this.serviceLine,
    required this.statusLabel,
  });

  final BookingDto booking;
  final String Function(BookingServiceDto service, String localeCode)
  serviceLine;
  final String Function(AppLocalizations l10n, BookingStatus status)
  statusLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    final atHomeLocation = booking.atHomeLocation;
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        _BookingSummarySection(
          booking: booking,
          l10n: l10n,
          localeCode: localeCode,
          statusLabel: statusLabel,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        _BookingServicesSection(
          booking: booking,
          l10n: l10n,
          localeCode: localeCode,
          serviceLine: serviceLine,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        _BookingLocationSection(
          booking: booking,
          l10n: l10n,
          atHomeLocation: atHomeLocation,
        ),
      ],
    );
  }
}

class _BookingSummarySection extends StatelessWidget {
  const _BookingSummarySection({
    required this.booking,
    required this.l10n,
    required this.localeCode,
    required this.statusLabel,
  });
  final BookingDto booking;
  final AppLocalizations l10n;
  final String localeCode;
  final String Function(AppLocalizations, BookingStatus) statusLabel;
  @override
  Widget build(BuildContext context) => BookingDetailsSection(
    title: l10n.bookingSummaryTitle,
    children: [
      BookingDetailLine(
        value: LocaleFormatters.dateTime(
          booking.timeSlot.toLocal(),
          localeCode,
        ),
      ),
      if (booking.endsAt != null)
        BookingDetailLine(
          value: l10n.bookingEndTimeLabel(
            LocaleFormatters.time(booking.endsAt!.toLocal(), localeCode),
          ),
        ),
      BookingDetailLine(value: statusLabel(l10n, booking.status)),
      if (booking.barber != null)
        BookingDetailLine(value: l10n.bookingWithBarber(booking.barber!.name)),
      if (booking.chair?.label != null)
        BookingDetailLine(value: l10n.bookingChairLabel(booking.chair!.label!)),
    ],
  );
}

class _BookingServicesSection extends StatelessWidget {
  const _BookingServicesSection({
    required this.booking,
    required this.l10n,
    required this.localeCode,
    required this.serviceLine,
  });
  final BookingDto booking;
  final AppLocalizations l10n;
  final String localeCode;
  final String Function(BookingServiceDto, String) serviceLine;
  @override
  Widget build(BuildContext context) {
    final totalPrice = booking.services.fold<double>(
      0,
      (total, service) => total + (service.price ?? 0),
    );
    final totalDuration = booking.services.fold<int>(
      0,
      (total, service) => total + (service.duration ?? 0),
    );
    return BookingDetailsSection(
      title: l10n.bookingSelectServices,
      children: [
        for (final service in booking.services)
          BookingDetailLine(value: serviceLine(service, localeCode)),
        if (booking.services.isNotEmpty) ...[
          const Divider(),
          BookingDetailLine(
            value: l10n.bookingTotalPrice(
              LocaleFormatters.decimal(totalPrice, localeCode),
            ),
          ),
          BookingDetailLine(value: l10n.bookingTotalDuration(totalDuration)),
        ],
      ],
    );
  }
}

class _BookingLocationSection extends StatelessWidget {
  const _BookingLocationSection({
    required this.booking,
    required this.l10n,
    required this.atHomeLocation,
  });
  final BookingDto booking;
  final AppLocalizations l10n;
  final AtHomeLocationDto? atHomeLocation;
  @override
  Widget build(BuildContext context) {
    final location = atHomeLocation;
    return BookingDetailsSection(
      title: location == null
          ? l10n.bookingChairLabel(booking.chair?.label ?? '')
          : l10n.bookingAtHomeToggle,
      children: location == null
          ? []
          : [
              BookingDetailLine(
                value: '${l10n.bookingAtHomeStreetLabel}: ${location.street}',
              ),
              BookingDetailLine(
                value:
                    '${l10n.bookingAtHomeBuildingLabel}: ${location.building}',
              ),
              BookingDetailLine(
                value: '${l10n.bookingAtHomeUnitLabel}: ${location.unit}',
              ),
              BookingDetailLine(
                value: '${location.latitude}, ${location.longitude}',
              ),
            ],
    );
  }
}
