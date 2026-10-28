import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/discovery/discovery_filter.entity.dart';
import 'package:client_app/src/features/discovery/discovery_filter_config.entity.dart';
import 'package:client_app/src/features/discovery/saved_filters.bloc.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeClientInteractionRepository repository;

  setUp(() {
    repository = FakeClientInteractionRepository()
      ..filters = [
        const SavedFilterDto(
          id: 'filter-1',
          name: 'Close',
          filterConfig: {'radius': 3},
        ),
      ];
  });

  test('load lists the saved filters', () async {
    final cubit = SavedFiltersCubit(repository);
    addTearDown(cubit.close);

    await cubit.load();

    expect(cubit.state.filters.single.name, 'Close');
    expect(cubit.state.isLoading, isFalse);
  });

  test(
    'save sends the trimmed name and config and appends the filter',
    () async {
      final cubit = SavedFiltersCubit(repository);
      addTearDown(cubit.close);
      await cubit.load();
      final config = DiscoveryFilterConfig.toConfig(
        const DiscoveryFilters(universe: 'women', radius: 7, ratingMin: 4),
      );

      await cubit.save('  Weekend  ', config);

      expect(repository.lastSavedName, 'Weekend');
      expect(repository.lastSavedConfig?['universe'], 'women');
      expect(cubit.state.filters, hasLength(2));
    },
  );

  test('a blank name is never saved', () async {
    final cubit = SavedFiltersCubit(repository);
    addTearDown(cubit.close);

    await cubit.save('   ', const {});

    expect(repository.lastSavedName, isNull);
  });

  test('delete removes the filter from the list', () async {
    final cubit = SavedFiltersCubit(repository);
    addTearDown(cubit.close);
    await cubit.load();

    await cubit.delete('filter-1');

    expect(repository.lastDeletedId, 'filter-1');
    expect(cubit.state.filters, isEmpty);
  });

  test('config round-trips through the discovery filters', () {
    const filters = DiscoveryFilters(
      universe: 'women',
      radius: 7,
      availableNow: true,
      priceRangeMin: 10,
      priceRangeMax: 90,
      ratingMin: 4,
      catalogItemIds: [3, 5],
    );

    final restored = DiscoveryFilterConfig.fromConfig(
      DiscoveryFilterConfig.toConfig(filters),
      const DiscoveryFilters(),
    );

    expect(restored, filters);
  });
}
