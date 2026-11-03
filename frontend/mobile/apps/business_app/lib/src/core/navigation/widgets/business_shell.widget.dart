import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.state.dart';

/// Bottom navigation for the five top-level destinations. The inbox tab
/// carries an unread badge.
class BusinessShell extends StatelessWidget {
  const BusinessShell({
    super.key,
    required this.navigationShell,
    required this.inbox,
  });

  final StatefulNavigationShell navigationShell;
  final BusinessInboxBloc inbox;

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
      bottomNavigationBar: BlocBuilder<BusinessInboxBloc, BusinessInboxState>(
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
              icon: const Icon(Icons.groups_outlined),
              selectedIcon: const Icon(Icons.groups),
              label: l10n.businessTabStaff,
            ),
            NavigationDestination(
              icon: const Icon(Icons.content_cut_outlined),
              selectedIcon: const Icon(Icons.content_cut),
              label: l10n.businessTabServices,
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
