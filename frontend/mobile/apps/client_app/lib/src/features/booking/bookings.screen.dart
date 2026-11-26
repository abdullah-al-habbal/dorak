import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/booking.event.dart';
import 'package:client_app/src/features/booking/booking.state.dart';
import 'package:client_app/src/features/booking/widgets/bookings_feed.widget.dart';
import 'package:client_app/src/features/booking/widgets/bookings_filter.widget.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({
    super.key,
    required this.bloc,
    required this.onLocaleToggle,
    required this.onRate,
    required this.onTrack,
    required this.onDetails,
  });

  final BookingBloc bloc;
  final VoidCallback onLocaleToggle;
  final void Function(String bookingId) onRate;
  final void Function(BookingDto booking) onTrack;
  final void Function(BookingDto booking) onDetails;

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  @override
  void initState() {
    super.initState();
    widget.bloc.add(const BookingsStarted());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic =
        Localizations.localeOf(context).languageCode == LocaleCodes.arabic;
    return BlocProvider.value(
      value: widget.bloc,
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.bookingsTabLabel),
          actions: [
            LocaleSwitcher(
              label: isArabic ? l10n.localeEnglish : l10n.localeArabic,
              onPressed: widget.onLocaleToggle,
            ),
          ],
        ),
        body: BlocBuilder<BookingBloc, BookingState>(
          bloc: widget.bloc,
          builder: (context, state) {
            if (state.page.hasFailedFirst) {
              return StatusView(
                icon: Icons.error_outline,
                title: l10n.errorTitleGeneric,
                message: ErrorFeedback.loadMessage(l10n, state.page.error),
                actionLabel: l10n.actionRetry,
                onAction: () => widget.bloc.add(const BookingsRetryRequested()),
              );
            }
            if (state.page.isFirstLoad) {
              return const AppLoader.page();
            }
            if (state.page.isEmpty) {
              return Column(
                children: [
                  BookingsFilter(bloc: widget.bloc, state: state),
                  Expanded(
                    child: StatusView(
                      icon: Icons.calendar_month_outlined,
                      title: l10n.bookingsTitle,
                      message: l10n.bookingsSubtitle,
                    ),
                  ),
                ],
              );
            }
            return BookingsFeed(
              bloc: widget.bloc,
              state: state,
              onRate: widget.onRate,
              onTrack: widget.onTrack,
              onDetails: widget.onDetails,
            );
          },
        ),
      ),
    );
  }
}
