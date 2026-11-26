import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/navigation/notification_location.entity.dart';
import 'package:client_app/src/features/notifications/notifications.bloc.dart';
import 'package:client_app/src/features/notifications/notifications.event.dart';
import 'package:client_app/src/features/notifications/notifications.state.dart';
import 'package:client_app/src/features/notifications/widgets/notification_tile.widget.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key, required this.bloc});

  final NotificationsBloc bloc;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  StreamSubscription<NotificationsState>? _refreshSubscription;

  @override
  void initState() {
    super.initState();
    widget.bloc.add(const NotificationsStarted());
  }

  @override
  void dispose() {
    unawaited(_refreshSubscription?.cancel());
    super.dispose();
  }

  Future<void> _refresh() async {
    await _refreshSubscription?.cancel();
    final completion = Completer<void>();
    var started = false;
    late final StreamSubscription<NotificationsState> subscription;
    _refreshSubscription = subscription = widget.bloc.stream.listen((state) {
      if (state.page.isRefreshing) {
        started = true;
      } else if (started && !completion.isCompleted) {
        completion.complete();
        unawaited(subscription.cancel());
        _refreshSubscription = null;
      }
    });
    widget.bloc.add(const NotificationsRefreshRequested());
    await completion.future;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return BlocBuilder<NotificationsBloc, NotificationsState>(
      bloc: widget.bloc,
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text(l10n.notificationsTitle),
            actions: [
              if (state.hasUnread)
                TextButton(
                  onPressed: state.isMarkingAll
                      ? null
                      : () => widget.bloc.add(
                          const NotificationsMarkAllReadRequested(),
                        ),
                  child: Text(l10n.notificationsMarkAllRead),
                ),
            ],
          ),
          body: _body(context, state, l10n, colors),
        );
      },
    );
  }

  Widget _body(
    BuildContext context,
    NotificationsState state,
    AppLocalizations l10n,
    DorakColors colors,
  ) {
    if (state.page.hasFailedFirst) {
      return StatusView(
        icon: Icons.error_outline,
        title: l10n.errorTitleGeneric,
        message: ErrorFeedback.loadMessage(l10n, state.page.error),
        actionLabel: l10n.actionRetry,
        onAction: () => widget.bloc.add(const NotificationsRetryRequested()),
      );
    }
    if (state.page.isFirstLoad) return const AppLoader.page();
    if (state.page.isEmpty) {
      return StatusView(
        icon: Icons.notifications_none_outlined,
        title: l10n.notificationsEmptyTitle,
        message: l10n.notificationsEmptyMessage,
      );
    }
    final items = state.page.items;
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification is ScrollUpdateNotification &&
            notification.metrics.pixels >=
                notification.metrics.maxScrollExtent - 200) {
          widget.bloc.add(const NotificationsLoadMoreRequested());
        }
        return false;
      },
      child: RefreshIndicator(
        color: colors.primary,
        onRefresh: _refresh,
        child: ListView.separated(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          itemCount: items.length + 2,
          separatorBuilder: (context, index) =>
              const SizedBox(height: DorakDimensions.spacingSmall),
          itemBuilder: (context, index) {
            if (index == 0) {
              return state.error == null
                  ? const SizedBox.shrink()
                  : StatusBanner(
                      message: ErrorFeedback.loadMessage(l10n, state.error),
                      actionLabel: l10n.actionRetry,
                      onAction: () => widget.bloc.add(
                        const NotificationsRefreshRequested(),
                      ),
                    );
            }
            if (index == items.length + 1) return _footer(state, l10n);
            final notification = items[index - 1];
            return NotificationTile(
              notification: notification,
              unreadLabel: l10n.notificationsUnreadLabel,
              isMarking: state.markingId == notification.id,
              onTap: () => _open(context, notification),
            );
          },
        ),
      ),
    );
  }

  void _open(BuildContext context, NotificationDto notification) {
    if (notification.isUnread) {
      widget.bloc.add(NotificationMarkReadRequested(notification.id));
    }
    final location = NotificationLocation.of(
      NotificationTarget.fromPayload(
        type: notification.type,
        data: notification.data,
      ),
    );
    if (location != null) unawaited(context.push<void>(location));
  }

  Widget _footer(NotificationsState state, AppLocalizations l10n) {
    if (state.page.isLoadingMore) return const AppLoader.inline();
    if (state.page.hasFailedMore) {
      return StatusBanner(
        message: ErrorFeedback.loadMessage(l10n, state.page.error),
        actionLabel: l10n.actionRetry,
        onAction: () => widget.bloc.add(const NotificationsRetryRequested()),
      );
    }
    return const SizedBox.shrink();
  }
}
