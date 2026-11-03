import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/inbox/stylist_inbox.bloc.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.state.dart';

/// Bottom navigation for the five top-level destinations. The inbox tab
/// carries an unread badge.
class StylistShell extends StatelessWidget {
  const StylistShell({
    super.key,
    required this.navigationShell,
    required this.inbox,
  });

  final StatefulNavigationShell navigationShell;
  final StylistInboxBloc inbox;

  void _select(int index) => navigationShell.goBranch(
    index,
    initialLocation: index == navigationShell.currentIndex,
  );

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: BlocBuilder<StylistInboxBloc, StylistInboxState>(
        bloc: inbox,
        buildWhen: (previous, current) =>
            previous.unreadCount != current.unreadCount,
        builder: (context, state) => NavigationBar(
          selectedIndex: navigationShell.currentIndex,
          onDestinationSelected: _select,
          indicatorColor: colors.primaryContainer,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.dashboard_outlined),
              selectedIcon: const Icon(Icons.dashboard),
              label: l10n.staffTabHome,
            ),
            NavigationDestination(
              icon: const Icon(Icons.history_outlined),
              selectedIcon: const Icon(Icons.history),
              label: l10n.stylistTabHistory,
            ),
            NavigationDestination(
              icon: const Icon(Icons.payments_outlined),
              selectedIcon: const Icon(Icons.payments),
              label: l10n.stylistTabEarnings,
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: state.unreadCount > 0,
                label: Text('${state.unreadCount}'),
                child: const Icon(Icons.notifications_none_outlined),
              ),
              selectedIcon: const Icon(Icons.notifications),
              label: l10n.staffTabInbox,
            ),
            NavigationDestination(
              icon: const Icon(Icons.more_horiz),
              label: l10n.staffTabMore,
            ),
          ],
        ),
      ),
    );
  }
}
