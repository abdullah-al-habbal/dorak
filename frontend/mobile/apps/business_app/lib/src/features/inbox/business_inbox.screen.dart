import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/notification_location.entity.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.state.dart';
import 'package:business_app/src/features/inbox/widgets/inbox_tile.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class BusinessInboxScreen extends StatelessWidget {
  const BusinessInboxScreen({
    super.key,
    required this.bloc,
    required this.onOpen,
  });

  final BusinessInboxBloc bloc;
  final ValueChanged<String> onOpen;

  void _open(NotificationDto notification) {
    if (notification.isUnread) bloc.markRead(notification.id);
    final location = NotificationLocation.of(
      NotificationTarget.fromPayload(
        type: notification.type,
        data: notification.data,
      ),
    );
    if (location != null) onOpen(location);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: BlocBuilder<BusinessInboxBloc, BusinessInboxState>(
        bloc: bloc,
        builder: (context, state) => Scaffold(
          appBar: AppBar(
            title: Text(l10n.staffInboxTitle),
            actions: [
              if (state.unreadCount > 0)
                TextButton(
                  onPressed: state.marking ? null : bloc.markAllRead,
                  child: Text(l10n.notificationsMarkAllRead),
                ),
            ],
          ),
          body: _body(context, state, l10n),
        ),
      ),
    );
  }

  Widget _body(
    BuildContext context,
    BusinessInboxState state,
    AppLocalizations l10n,
  ) {
    if (state.page.hasFailedFirst) {
      return StatusView(
        icon: Icons.error_outline,
        title: l10n.errorTitleGeneric,
        message: ErrorFeedback.loadMessage(l10n, state.page.error),
        actionLabel: l10n.actionRetry,
        onAction: bloc.load,
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
        if (notification.metrics.pixels >=
            notification.metrics.maxScrollExtent - _loadMoreThreshold) {
          bloc.loadMore();
        }
        return false;
      },
      child: RefreshIndicator(
        onRefresh: bloc.load,
        child: ListView.separated(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          itemCount: items.length + 1,
          separatorBuilder: (context, index) =>
              const SizedBox(height: DorakDimensions.spacingSmall),
          itemBuilder: (context, index) {
            if (index == items.length) {
              return state.page.isLoadingMore
                  ? const AppLoader.inline()
                  : const SizedBox.shrink();
            }
            final item = items[index];
            return InboxTile(
              notification: item,
              unreadLabel: l10n.notificationsUnreadLabel,
              onTap: () => _open(item),
            );
          },
        ),
      ),
    );
  }

  static const double _loadMoreThreshold = 200;
}
