import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/profile/history.state.dart';
import 'package:client_app/src/features/profile/history_rebook_error.entity.dart';
import 'package:client_app/src/features/profile/widgets/history_card.widget.dart';

class HistoryFeed extends StatelessWidget {
  const HistoryFeed({
    super.key,
    required this.state,
    required this.localeCode,
    required this.onRetry,
    required this.onRebook,
  });

  final HistoryState state;
  final String localeCode;
  final VoidCallback onRetry;
  final void Function(ServiceHistoryDto item) onRebook;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (state.page.hasFailedFirst) {
      return StatusView(
        icon: Icons.error_outline,
        title: l10n.errorTitleGeneric,
        message: l10n.errorNetwork,
        actionLabel: l10n.actionRetry,
        onAction: onRetry,
      );
    }
    if (state.page.isFirstLoad) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: DorakDimensions.spacingMedium),
        child: Center(child: AppLoader.inline()),
      );
    }
    if (state.page.isEmpty) {
      return StatusView(
        icon: Icons.history_outlined,
        title: l10n.historyEmptyTitle,
        message: l10n.historyEmptyMessage,
      );
    }
    return Column(children: _items(context, l10n));
  }

  List<Widget> _items(BuildContext context, AppLocalizations l10n) {
    final children = <Widget>[];
    if (state.rebookError != null) {
      children.add(
        Padding(
          padding: const EdgeInsets.only(bottom: DorakDimensions.spacingSmall),
          child: StatusBanner(
            message: HistoryRebookError.message(state.rebookError, l10n),
          ),
        ),
      );
    }
    for (final item in state.page.items) {
      children.add(
        Padding(
          padding: const EdgeInsets.only(bottom: DorakDimensions.spacingMedium),
          child: HistoryCard(
            item: item,
            itemName: LocalizedName.resolve(
              item.catalogItem?.name ?? const <String, String>{},
              localeCode,
            ),
            localeCode: localeCode,
            rebookLabel: l10n.historyRebookAction,
            isRebooking: state.rebookingId == item.id,
            onRebook: () => onRebook(item),
          ),
        ),
      );
    }
    children.add(_feedFooter(l10n));
    return children;
  }

  Widget _feedFooter(AppLocalizations l10n) {
    if (state.page.isLoadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: DorakDimensions.spacingMedium),
        child: Center(child: AppLoader.inline()),
      );
    }
    if (state.page.hasFailedMore) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: DorakDimensions.spacingSmall),
        child: StatusBanner(
          message: l10n.errorNetwork,
          actionLabel: l10n.actionRetry,
          onAction: onRetry,
        ),
      );
    }
    return const SizedBox.shrink();
  }
}
