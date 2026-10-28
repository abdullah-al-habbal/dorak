import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/discovery/saved_filters.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.event.dart';
import 'package:client_app/src/features/discovery/discovery.state.dart';
import 'package:client_app/src/features/discovery/widgets/discovery_feed.widget.dart';

class DiscoveryView extends StatelessWidget {
  const DiscoveryView({
    super.key,
    required this.bloc,
    required this.onLocaleToggle,
    required this.onBookNow,
    required this.onViewDetails,
    this.onViewStylist,
    this.savedFilters,
    this.onPreferences,
  });

  final DiscoveryBloc bloc;
  final VoidCallback onLocaleToggle;
  final VoidCallback onBookNow;
  final ValueChanged<String>? onViewDetails;
  final ValueChanged<String>? onViewStylist;
  final SavedFiltersCubit? savedFilters;
  final VoidCallback? onPreferences;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.discoveryTitle),
        actions: [
          LocaleSwitcher(
            label: isArabic ? l10n.localeEnglish : l10n.localeArabic,
            onPressed: onLocaleToggle,
          ),
        ],
      ),
      body: BlocBuilder<DiscoveryBloc, DiscoveryState>(
        bloc: bloc,
        builder: (context, state) {
          if (!state.locationReady) {
            return StatusView(
              icon: Icons.location_on_outlined,
              title: l10n.locationRequiredTitle,
              message: l10n.locationRequiredMessage,
              actionLabel: l10n.enableLocationAction,
              onAction: () => bloc.add(const DiscoveryLocationRequested()),
            );
          }
          if (state.page.hasFailedFirst) {
            return StatusView(
              icon: Icons.error_outline,
              title: l10n.errorTitleGeneric,
              message: l10n.errorNetwork,
              actionLabel: l10n.actionRetry,
              onAction: () => bloc.add(const DiscoveryRetryRequested()),
            );
          }
          if (state.page.isFirstLoad) return const AppLoader.page();
          if (state.page.isEmpty) {
            return StatusView(
              icon: Icons.search_off_outlined,
              title: l10n.emptyTitleGeneric,
              message: l10n.emptyMessageGeneric,
              actionLabel: l10n.actionRetry,
              onAction: () => bloc.add(const DiscoveryRetryRequested()),
            );
          }
          return DiscoveryFeed(
            bloc: bloc,
            state: state,
            onBookNow: onBookNow,
            onViewDetails: onViewDetails,
            onViewStylist: onViewStylist,
            savedFilters: savedFilters,
            onPreferences: onPreferences,
          );
        },
      ),
    );
  }
}
