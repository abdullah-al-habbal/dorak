import 'dart:async';

import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/core/formatting/rating_label.entity.dart';
import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.event.dart';
import 'package:client_app/src/features/discovery/discovery.state.dart';
import 'package:client_app/src/features/discovery/widgets/discovery_filter_bar.widget.dart';
import 'package:client_app/src/features/discovery/widgets/discovery_result_card.widget.dart';

class DiscoveryFeed extends StatefulWidget {
  const DiscoveryFeed({
    super.key,
    required this.bloc,
    required this.state,
    required this.onBookNow,
    required this.onViewDetails,
  });

  final DiscoveryBloc bloc;
  final DiscoveryState state;
  final VoidCallback onBookNow;
  final ValueChanged<String>? onViewDetails;

  @override
  State<DiscoveryFeed> createState() => _DiscoveryFeedState();
}

class _DiscoveryFeedState extends State<DiscoveryFeed> {
  List<BranchDto>? _cachedSource;
  String? _cachedQuery;
  List<BranchDto> _cachedItems = const [];
  StreamSubscription<DiscoveryState>? _refreshSubscription;

  List<BranchDto> get _items {
    final source = widget.state.page.items;
    final query = widget.state.searchQuery.toLowerCase();
    if (identical(source, _cachedSource) && query == _cachedQuery) {
      return _cachedItems;
    }
    _cachedSource = source;
    _cachedQuery = query;
    _cachedItems = List.unmodifiable(
      source.where((branch) => branch.name.toLowerCase().contains(query)),
    );
    return _cachedItems;
  }

  Future<void> _refresh() async {
    await _refreshSubscription?.cancel();
    final completion = Completer<void>();
    var started = false;
    late final StreamSubscription<DiscoveryState> subscription;
    _refreshSubscription = subscription = widget.bloc.stream.listen((state) {
      if (state.page.isRefreshing) {
        started = true;
      } else if (started && !completion.isCompleted) {
        completion.complete();
        unawaited(subscription.cancel());
        _refreshSubscription = null;
      }
    });
    widget.bloc.add(const DiscoveryRefreshRequested());
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
    final bloc = widget.bloc;
    final items = _items;
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification is ScrollUpdateNotification &&
            notification.metrics.pixels >=
                notification.metrics.maxScrollExtent - 200) {
          bloc.add(const DiscoveryLoadMoreRequested());
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
            final branch = items[index - 1];
            return Padding(
              padding: const EdgeInsets.only(
                bottom: DorakDimensions.spacingMedium,
              ),
              child: DiscoveryResultCard(
                branch: branch,
                ratingLabel: RatingLabel.of(
                  l10n,
                  average: branch.ratingAvg,
                  count: branch.ratingCount,
                  localeCode: Localizations.localeOf(context).languageCode,
                ),
                rankBadge: branch.rank == null
                    ? null
                    : l10n.discoverRankBadge(branch.rank!),
                compatibilityBadge: branch.compatibilityScore == null
                    ? null
                    : l10n.discoverCompatibilityBadge(
                        (branch.compatibilityScore! * 100).round(),
                      ),
                distanceLabel: branch.distance == null
                    ? null
                    : l10n.discoverDistanceLabel(branch.distance!),
                bookNowLabel: l10n.bookNow,
                onBookNow: widget.onBookNow,
                viewDetailsLabel: l10n.viewDetails,
                onViewDetails: widget.onViewDetails == null
                    ? null
                    : () => widget.onViewDetails!(branch.id.toString()),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _feedHeader(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final state = widget.state;
    final bloc = widget.bloc;
    final filters = state.filters;
    return Padding(
      padding: const EdgeInsets.only(bottom: DorakDimensions.spacingMedium),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (state.isStale)
            Padding(
              padding: const EdgeInsets.only(
                bottom: DorakDimensions.spacingSmall,
              ),
              child: StatusBanner(
                message: l10n.discoverStaleLabel,
                color: colors.secondary,
              ),
            ),
          if (state.page.hasFailedRefresh)
            Padding(
              padding: const EdgeInsets.only(
                bottom: DorakDimensions.spacingSmall,
              ),
              child: StatusBanner(
                message: l10n.errorNetwork,
                actionLabel: l10n.actionRetry,
                onAction: () => bloc.add(const DiscoveryRetryRequested()),
              ),
            ),
          DiscoveryFilterBar(
            selectedUniverse: filters.universe,
            menLabel: l10n.discoverUniverseMen,
            womenLabel: l10n.discoverUniverseWomen,
            onUniverseChanged: (universe) =>
                bloc.add(DiscoveryUniverseChanged(universe)),
            availableNow: filters.availableNow,
            onAvailableNowChanged: (value) => bloc.add(
              DiscoveryFiltersChanged(
                value == null
                    ? filters.copyWith(clearAvailableNow: true)
                    : filters.copyWith(availableNow: value),
              ),
            ),
            availableNowLabel: l10n.availableNow,
            priceMin: filters.priceRangeMin,
            priceMax: filters.priceRangeMax,
            onPriceChanged: (range) => bloc.add(
              DiscoveryFiltersChanged(
                range.start <= 0 && range.end >= DiscoveryFilterBar.maxPrice
                    ? filters.copyWith(clearPriceRange: true)
                    : filters.copyWith(
                        priceRangeMin: range.start,
                        priceRangeMax: range.end,
                      ),
              ),
            ),
            priceLabel: l10n.price,
            ratingMin: filters.ratingMin,
            onRatingChanged: (value) => bloc.add(
              DiscoveryFiltersChanged(
                value == null
                    ? filters.copyWith(clearRatingMin: true)
                    : filters.copyWith(ratingMin: value),
              ),
            ),
            ratingLabel: l10n.rating,
            rankedByDistanceLabel: l10n.discoverRankedByDistance,
          ),
          const SizedBox(height: DorakDimensions.spacingSmall),
          TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search)),
            onChanged: (query) => bloc.add(DiscoverySearchChanged(query)),
          ),
          if (state.catalogItems.isNotEmpty)
            Wrap(
              spacing: DorakDimensions.spacingSmall,
              children: state.catalogItems.map((item) {
                final id = int.tryParse(item.id);
                if (id == null) return const SizedBox.shrink();
                final selected = filters.catalogItemIds.contains(id);
                return FilterChip(
                  label: Text(
                    item.name[Localizations.localeOf(context).languageCode] ??
                        item.name.values.firstOrNull ??
                        item.id,
                  ),
                  selected: selected,
                  onSelected: (value) {
                    final ids = List<int>.of(filters.catalogItemIds);
                    value ? ids.add(id) : ids.remove(id);
                    bloc.add(
                      DiscoveryFiltersChanged(
                        filters.copyWith(catalogItemIds: ids),
                      ),
                    );
                  },
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _feedFooter(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = widget.state;
    final bloc = widget.bloc;
    if (state.page.isLoadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: DorakDimensions.spacingMedium),
        child: AppLoader.inline(),
      );
    }
    if (state.page.hasFailedMore) {
      return Padding(
        padding: const EdgeInsets.symmetric(
          vertical: DorakDimensions.spacingSmall,
        ),
        child: StatusBanner(
          message: l10n.errorNetwork,
          actionLabel: l10n.actionRetry,
          onAction: () => bloc.add(const DiscoveryRetryRequested()),
        ),
      );
    }
    return const SizedBox.shrink();
  }
}
