import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/appointments/stylist_appointments.bloc.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.state.dart';
import 'package:stylist_app/src/features/appointments/widgets/past_appointment_tile.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistAppointmentsScreen extends StatelessWidget {
  const StylistAppointmentsScreen({super.key, required this.bloc});

  final StylistAppointmentsBloc bloc;

  static const double _loadMoreThreshold = 200;

  static const _filters = <BookingStatus?>[
    null,
    BookingStatus.completed,
    BookingStatus.cancelled,
    BookingStatus.noShow,
  ];

  String _label(AppLocalizations l10n, BookingStatus? status) =>
      switch (status) {
        null => l10n.stylistHistoryFilterAll,
        BookingStatus.completed => l10n.bookingStatusCompleted,
        BookingStatus.cancelled => l10n.bookingStatusCancelled,
        BookingStatus.noShow => l10n.bookingStatusNoShow,
        _ => l10n.bookingStatusUnknown,
      };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistHistoryTitle)),
        body: BlocBuilder<StylistAppointmentsBloc, StylistAppointmentsState>(
          bloc: bloc,
          builder: (context, state) => Column(
            children: [
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                  horizontal: DorakDimensions.marginMobile,
                ),
                child: Row(
                  children: [
                    for (final status in _filters)
                      Padding(
                        padding: const EdgeInsetsDirectional.only(
                          end: DorakDimensions.spacingSmall,
                        ),
                        child: ChoiceChip(
                          label: Text(_label(l10n, status)),
                          selected: state.status == status,
                          onSelected: (_) => bloc.filter(status),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(child: _body(state, l10n)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _body(StylistAppointmentsState state, AppLocalizations l10n) {
    if (state.page.hasFailedFirst) {
      return StatusView(
        icon: Icons.error_outline,
        title: l10n.errorTitleGeneric,
        message: l10n.errorNetwork,
        actionLabel: l10n.actionRetry,
        onAction: bloc.load,
      );
    }
    if (state.page.isFirstLoad) return const AppLoader.page();
    if (state.page.isEmpty) {
      return StatusView(
        icon: Icons.event_busy_outlined,
        title: l10n.stylistHistoryTitle,
        message: l10n.stylistHistoryEmpty,
      );
    }
    final items = state.page.items;
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification.metrics.pixels >=
            notification.metrics.maxScrollExtent - _loadMoreThreshold) {
          bloc.loadMore();
        }
        return false;
      },
      child: RefreshIndicator(
        onRefresh: bloc.load,
        child: ListView.builder(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          itemCount: items.length + 1,
          itemBuilder: (context, index) {
            if (index == items.length) {
              return state.page.isLoadingMore
                  ? const AppLoader.inline()
                  : const SizedBox.shrink();
            }
            return PastAppointmentTile(booking: items[index]);
          },
        ),
      ),
    );
  }
}
