import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/booking.event.dart';
import 'package:client_app/src/features/booking/booking.state.dart';
import 'package:client_app/src/features/booking/booking_eligibility.entity.dart';
import 'package:client_app/src/features/booking/widgets/booking_card.widget.dart';
import 'package:client_app/src/features/booking/widgets/bookings_filter.widget.dart';

class BookingsFeed extends StatefulWidget {
  const BookingsFeed({
    super.key,
    required this.bloc,
    required this.state,
    required this.onRate,
    required this.onTrack,
    required this.onDetails,
  });

  final BookingBloc bloc;
  final BookingState state;
  final void Function(String bookingId) onRate;
  final void Function(BookingDto booking) onTrack;
  final void Function(BookingDto booking) onDetails;

  @override
  State<BookingsFeed> createState() => _BookingsFeedState();
}

class _BookingsFeedState extends State<BookingsFeed> {
  StreamSubscription<BookingState>? _refreshSubscription;

  Future<void> _refresh() async {
    await _refreshSubscription?.cancel();
    final completion = Completer<void>();
    var started = false;
    late final StreamSubscription<BookingState> subscription;
    _refreshSubscription = subscription = widget.bloc.stream.listen((state) {
      if (state.page.isRefreshing) {
        started = true;
      } else if (started && !completion.isCompleted) {
        completion.complete();
        unawaited(subscription.cancel());
        _refreshSubscription = null;
      }
    });
    widget.bloc.add(const BookingsRefreshRequested());
    await completion.future;
  }

  @override
  void dispose() {
    unawaited(_refreshSubscription?.cancel());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final localeCode = Localizations.localeOf(context).languageCode;
    final bloc = widget.bloc;
    final state = widget.state;
    final items = state.page.items;
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification is ScrollUpdateNotification &&
            notification.metrics.pixels >=
                notification.metrics.maxScrollExtent - 200) {
          bloc.add(const BookingsLoadMoreRequested());
        }
        return false;
      },
      child: RefreshIndicator(
        color: colors.primary,
        onRefresh: _refresh,
        child: ListView.builder(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          itemCount: items.length + 2,
          itemBuilder: (context, index) {
            if (index == 0) return _feedHeader(context);
            if (index == items.length + 1) return _feedFooter(context);
            final booking = items[index - 1];
            final cancelableStatus = BookingEligibility.isCancelable(booking);
            final cancellationAllowed =
                BookingEligibility.isWithinCancellationWindow(booking);
            final cancellable = BookingEligibility.canCancel(
              booking,
              state.filter,
            );
            final rateable = BookingEligibility.isRateable(booking);
            return Padding(
              padding: const EdgeInsets.only(
                bottom: DorakDimensions.spacingMedium,
              ),
              child: BookingCard(
                booking: booking,
                localeCode: localeCode,
                statusLabel: _statusLabel(context, booking.status),
                barberLine: booking.barber == null
                    ? null
                    : l10n.bookingWithBarber(booking.barber!.name),
                chairLine: booking.chair?.label == null
                    ? null
                    : l10n.bookingChairLabel(booking.chair!.label!),
                endTimeLine: booking.endsAt == null
                    ? null
                    : l10n.bookingEndTimeLabel(
                        LocaleFormatters.time(
                          booking.endsAtOnBranchClock!,
                          localeCode,
                        ),
                      ),
                cancelLabel: l10n.bookingCancelAction,
                cancellationWarning: cancelableStatus && !cancellationAllowed
                    ? l10n.bookingCancellationClosed
                    : null,
                isCancelling: state.cancellingId == booking.id,
                onCancel: cancellable
                    ? () => _confirmCancel(context, bloc, booking.id)
                    : null,
                rateLabel: rateable ? l10n.bookingRateAction : null,
                onRate: rateable ? () => widget.onRate(booking.id) : null,
                trackerLabel: l10n.bookingTrackAction,
                onTrack: () => widget.onTrack(booking),
                detailsLabel: l10n.viewDetails,
                onDetails: () => widget.onDetails(booking),
              ),
            );
          },
        ),
      ),
    );
  }

  String _statusLabel(BuildContext context, BookingStatus status) {
    final l10n = AppLocalizations.of(context)!;
    return switch (status) {
      BookingStatus.confirmed => l10n.bookingStatusConfirmed,
      BookingStatus.pending => l10n.bookingStatusPending,
      BookingStatus.cancelled => l10n.bookingStatusCancelled,
      BookingStatus.completed => l10n.bookingStatusCompleted,
      BookingStatus.inProgress => l10n.bookingStatusInProgress,
      BookingStatus.noShow => l10n.bookingStatusNoShow,
      BookingStatus.unknown => l10n.bookingStatusUnknown,
    };
  }

  Widget _feedHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: DorakDimensions.spacingMedium),
      child: BookingsFilter(bloc: widget.bloc, state: widget.state),
    );
  }

  Widget _feedFooter(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (widget.state.page.isLoadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: DorakDimensions.spacingMedium),
        child: AppLoader.inline(),
      );
    }
    if (widget.state.page.hasFailedMore) {
      return Padding(
        padding: const EdgeInsets.symmetric(
          vertical: DorakDimensions.spacingSmall,
        ),
        child: StatusBanner(
          message: ErrorFeedback.loadMessage(l10n, widget.state.page.error),
          actionLabel: l10n.actionRetry,
          onAction: () => widget.bloc.add(const BookingsRetryRequested()),
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

Future<void> _confirmCancel(BuildContext context, BookingBloc bloc, String id) {
  final l10n = AppLocalizations.of(context)!;
  return showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(l10n.bookingCancelConfirmTitle),
      content: Text(l10n.bookingCancelConfirmMessage),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(),
          child: Text(l10n.cancel),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(dialogContext).pop();
            bloc.add(BookingsCancelRequested(id));
          },
          child: Text(l10n.bookingCancelConfirm),
        ),
      ],
    ),
  );
}
