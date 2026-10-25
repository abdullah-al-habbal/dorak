import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/booking.event.dart';
import 'package:client_app/src/features/booking/booking.state.dart';
import 'package:client_app/src/features/booking/widgets/booking_card.widget.dart';

class BookingsScreen extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: bloc,
      child: _BookingsView(
        bloc: bloc,
        onLocaleToggle: onLocaleToggle,
        onRate: onRate,
        onTrack: onTrack,
        onDetails: onDetails,
      ),
    );
  }
}

class _BookingsView extends StatefulWidget {
  const _BookingsView({
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
  State<_BookingsView> createState() => _BookingsViewState();
}

class _BookingsViewState extends State<_BookingsView> {
  @override
  void initState() {
    super.initState();
    widget.bloc.add(const BookingsStarted());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    return Scaffold(
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
              message: l10n.errorNetwork,
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
                _BookingsFilter(bloc: widget.bloc, state: state),
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
          return _BookingsFeed(
            bloc: widget.bloc,
            state: state,
            onRate: widget.onRate,
            onTrack: widget.onTrack,
            onDetails: widget.onDetails,
          );
        },
      ),
    );
  }
}

class _BookingsFeed extends StatefulWidget {
  const _BookingsFeed({
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
  State<_BookingsFeed> createState() => _BookingsFeedState();
}

class _BookingsFeedState extends State<_BookingsFeed> {
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
            final cancellationAllowed =
                booking.cancellationEligible ??
                booking.timeSlot.isAfter(
                  DateTime.now().add(const Duration(hours: 2)),
                );
            final cancelableStatus =
                booking.status == BookingStatus.pending ||
                booking.status == BookingStatus.confirmed;
            final cancellable =
                state.filter == 'upcoming' &&
                cancelableStatus &&
                cancellationAllowed;
            final rateable = booking.status == BookingStatus.completed;
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
                          booking.endsAt!.toLocal(),
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
      BookingStatus.canceled => l10n.bookingStatusCanceled,
      BookingStatus.completed => l10n.bookingStatusCompleted,
      BookingStatus.inProgress => l10n.bookingStatusInProgress,
      BookingStatus.noShow => l10n.bookingStatusNoShow,
    };
  }

  Widget _feedHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: DorakDimensions.spacingMedium),
      child: _BookingsFilter(bloc: widget.bloc, state: widget.state),
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
          message: l10n.errorNetwork,
          actionLabel: l10n.actionRetry,
          onAction: () => widget.bloc.add(const BookingsRetryRequested()),
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

class _BookingsFilter extends StatelessWidget {
  const _BookingsFilter({required this.bloc, required this.state});

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
