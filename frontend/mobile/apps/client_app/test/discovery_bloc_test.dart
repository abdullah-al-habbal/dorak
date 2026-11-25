import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.event.dart';
import 'package:client_app/src/features/discovery/discovery.state.dart';
import 'package:client_app/src/features/discovery/discovery_filter.entity.dart';

import 'helpers/fakes.dart';
import 'package:client_app/src/features/discovery/discovery_filter_constants.entity.dart';

void main() {
  test('the default universe is the client men universe', () {
    expect(DiscoveryFilters.defaultUniverse, ClientUniverse.men.value);
  });

  late FakeExploreRepository repository;
  late FakeLocationProvider location;
  late FakeFeedCache cache;

  setUp(() {
    repository = FakeExploreRepository();
    location = FakeLocationProvider();
    cache = FakeFeedCache();
  });

  DiscoveryBloc bloc() => DiscoveryBloc(repository, location, cache: cache);

  group('preferred universe', () {
    test('starts from the session client universe', () {
      final seeded = DiscoveryBloc(
        repository,
        location,
        initialUniverse: 'women',
      );
      addTearDown(seeded.close);

      expect(seeded.state.filters.universe, 'women');
    });

    test('falls back to the default universe without a preference', () {
      expect(bloc().state.filters.universe, DiscoveryFilters.defaultUniverse);
    });

    test('changing the universe persists it through the profile API', () async {
      final profile = FakeProfileRepository();
      final persisting = DiscoveryBloc(
        repository,
        location,
        profile: profile,
        initialUniverse: 'men',
      );
      addTearDown(persisting.close);

      persisting.add(const DiscoveryUniverseChanged('women'));
      await Future<void>.delayed(const Duration(milliseconds: 20));

      expect(profile.lastUniverse, 'women');
      expect(persisting.state.filters.universe, 'women');
    });
  });

  group('initial state', () {
    test('asks for location before anything else', () {
      expect(
        bloc().state,
        DiscoveryState(page: const Paged<ExploreSearchItemDto>.initial()),
      );
    });
  });

  group('DiscoveryLocationRequested', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'denied permission stays on the location prompt',
      build: bloc,
      setUp: () => location.status = LocationPermissionStatus.denied,
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      expect: () => [
        DiscoveryState(
          locationStatus: LocationPermissionStatus.denied,
          page: const Paged<ExploreSearchItemDto>.initial(),
        ),
      ],
      verify: (_) {
        expect(repository.searchPayloadCalls, 0);
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'granted permission with a fix loads the first page and writes cache',
      build: bloc,
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      verify: (bloc) {
        expect(bloc.state.locationReady, isTrue);
        expect(bloc.state.page.items, hasLength(1));
        expect(bloc.state.page.items.first.branch!.name, 'Branch 1');
        expect(bloc.state.isStale, isFalse);
        expect(cache.writeCalls, 1);
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'granted permission without a fix stays on the location prompt',
      build: bloc,
      setUp: () => location.position = null,
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      expect: () => [
        DiscoveryState(
          locationStatus: LocationPermissionStatus.granted,
          page: const Paged<ExploreSearchItemDto>.initial(),
        ),
      ],
      verify: (_) {
        expect(repository.searchPayloadCalls, 0);
      },
    );
  });

  group('cache', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'fresh cache renders without touching the network',
      build: bloc,
      setUp: () {
        final key = cache.keyFor(
          universe: 'men',
          latitude: 24.7136,
          longitude: 46.6753,
          radius: 10,
        );
        cache.entries[key] = FeedCacheEntry(
          items: const [
            {
              'type': 'branch',
              'entity': {
                'id': '9',
                'name': 'Cached Branch',
                'email': 'cached@example.com',
                'status': 'enabled',
                'latitude': 24.7136,
                'longitude': 46.6753,
                'brand_id': '7',
              },
            },
          ],
          meta: const {
            'pagination': {
              'total': 1,
              'count': 1,
              'per_page': 20,
              'current_page': 1,
              'total_pages': 1,
            },
          },
          storedAt: DateTime.now(),
        );
      },
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      verify: (bloc) {
        expect(bloc.state.page.items.first.branch!.name, 'Cached Branch');
        expect(bloc.state.isStale, isFalse);
        expect(repository.searchPayloadCalls, 0);
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'stale cache renders first, then revalidates from the network',
      build: bloc,
      setUp: () {
        final key = cache.keyFor(
          universe: 'men',
          latitude: 24.7136,
          longitude: 46.6753,
          radius: 10,
        );
        cache.entries[key] = FeedCacheEntry(
          items: const [
            {
              'type': 'branch',
              'entity': {
                'id': '9',
                'name': 'Cached Branch',
                'email': 'cached@example.com',
                'status': 'enabled',
                'latitude': 24.7136,
                'longitude': 46.6753,
                'brand_id': '7',
              },
            },
          ],
          meta: const {
            'pagination': {
              'total': 1,
              'count': 1,
              'per_page': 20,
              'current_page': 1,
              'total_pages': 1,
            },
          },
          storedAt: DateTime.utc(2020, 1, 1),
        );
      },
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      verify: (bloc) {
        expect(repository.searchPayloadCalls, 1);
        expect(bloc.state.page.items.first.branch!.name, 'Branch 1');
        expect(bloc.state.isStale, isFalse);
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'offline with a stale cache keeps the cached items marked stale',
      build: bloc,
      setUp: () {
        repository.error = offline();
        final key = cache.keyFor(
          universe: 'men',
          latitude: 24.7136,
          longitude: 46.6753,
          radius: 10,
        );
        cache.entries[key] = FeedCacheEntry(
          items: const [
            {
              'type': 'branch',
              'entity': {
                'id': '9',
                'name': 'Cached Branch',
                'email': 'cached@example.com',
                'status': 'enabled',
                'latitude': 24.7136,
                'longitude': 46.6753,
                'brand_id': '7',
              },
            },
          ],
          meta: const {
            'pagination': {
              'total': 1,
              'count': 1,
              'per_page': 20,
              'current_page': 1,
              'total_pages': 1,
            },
          },
          storedAt: DateTime.utc(2020, 1, 1),
        );
      },
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      verify: (bloc) {
        expect(bloc.state.page.items.first.branch!.name, 'Cached Branch');
        expect(bloc.state.isStale, isTrue);
        expect(bloc.state.page.hasFailed, isFalse);
      },
    );
  });

  group('failures', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'first load with no cache fails the page',
      build: bloc,
      setUp: () => repository.error = offline(),
      act: (bloc) => bloc.add(const DiscoveryLocationRequested()),
      verify: (bloc) {
        expect(bloc.state.page.hasFailedFirst, isTrue);
        expect(bloc.state.page.items, isEmpty);
      },
    );
  });

  group('DiscoveryUniverseChanged', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'evicts the old universe key and reloads',
      build: bloc,
      seed: () => DiscoveryState(
        locationStatus: LocationPermissionStatus.granted,
        latitude: 24.7136,
        longitude: 46.6753,
        page: const Paged<ExploreSearchItemDto>.initial().succeeded(
          asSearchPage(testBranchPage()),
        ),
      ),
      act: (bloc) => bloc.add(const DiscoveryUniverseChanged('women')),
      verify: (bloc) {
        expect(bloc.state.filters.universe, 'women');
        expect(repository.lastUniverse, 'women');
        expect(
          cache.evictedKeys,
          contains(
            cache.keyFor(
              universe: 'men',
              latitude: 24.7136,
              longitude: 46.6753,
              radius: 10,
            ),
          ),
        );
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'same universe is a no-op',
      build: bloc,
      seed: () => DiscoveryState(
        locationStatus: LocationPermissionStatus.granted,
        latitude: 24.7136,
        longitude: 46.6753,
      ),
      act: (bloc) => bloc.add(const DiscoveryUniverseChanged('men')),
      expect: () => [],
      verify: (_) {
        expect(repository.searchPayloadCalls, 0);
      },
    );
  });

  group('DiscoveryFiltersChanged', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'forwards the available-now filter to the query',
      build: bloc,
      seed: () => DiscoveryState(
        locationStatus: LocationPermissionStatus.granted,
        latitude: 24.7136,
        longitude: 46.6753,
      ),
      act: (bloc) => bloc.add(
        const DiscoveryFiltersChanged(DiscoveryFilters(availableNow: true)),
      ),
      verify: (bloc) {
        expect(bloc.state.filters.availableNow, isTrue);
        expect(repository.lastAvailableNow, isTrue);
      },
    );
  });

  group('pagination', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'load more appends the next page',
      build: bloc,
      seed: () => DiscoveryState(
        locationStatus: LocationPermissionStatus.granted,
        latitude: 24.7136,
        longitude: 46.6753,
        page: const Paged<ExploreSearchItemDto>.initial().succeeded(
          asSearchPage(
            testBranchPage(branches: [testBranch(id: 1)], totalPages: 2),
          ),
        ),
      ),
      setUp: () {
        repository.morePage = testBranchPage(
          branches: [testBranch(id: 2)],
          currentPage: 2,
          totalPages: 2,
        );
      },
      act: (bloc) => bloc.add(const DiscoveryLoadMoreRequested()),
      verify: (bloc) {
        expect(repository.lastPage, 2);
        expect(bloc.state.page.items.map((branch) => branch.id), ['1', '2']);
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'load more failure keeps the loaded items',
      build: bloc,
      seed: () => DiscoveryState(
        locationStatus: LocationPermissionStatus.granted,
        latitude: 24.7136,
        longitude: 46.6753,
        page: const Paged<ExploreSearchItemDto>.initial().succeeded(
          asSearchPage(
            testBranchPage(branches: [testBranch(id: 1)], totalPages: 2),
          ),
        ),
      ),
      setUp: () => repository.error = offline(),
      act: (bloc) => bloc.add(const DiscoveryLoadMoreRequested()),
      verify: (bloc) {
        expect(bloc.state.page.hasFailedMore, isTrue);
        expect(bloc.state.page.items, hasLength(1));
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'refresh revalidates the first page',
      build: bloc,
      seed: () => DiscoveryState(
        locationStatus: LocationPermissionStatus.granted,
        latitude: 24.7136,
        longitude: 46.6753,
        page: const Paged<ExploreSearchItemDto>.initial().succeeded(
          asSearchPage(testBranchPage()),
        ),
      ),
      act: (bloc) => bloc.add(const DiscoveryRefreshRequested()),
      verify: (bloc) {
        expect(repository.searchPayloadCalls, 1);
        expect(bloc.state.page.items, hasLength(1));
        expect(bloc.state.isStale, isFalse);
      },
    );
  });

  group('DiscoveryRetryRequested', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'retry without location asks for permission first',
      build: bloc,
      act: (bloc) => bloc.add(const DiscoveryRetryRequested()),
      verify: (bloc) {
        expect(location.ensurePermissionCalls, 1);
        expect(bloc.state.locationReady, isTrue);
      },
    );
  });

  group('DiscoverySearchChanged', () {
    blocTest<DiscoveryBloc, DiscoveryState>(
      'typing a query triggers exactly one request after the debounce',
      build: bloc,
      act: (bloc) async {
        bloc.add(const DiscoveryLocationRequested());
        await pumpEventQueue();
        final callsAfterLocation = repository.searchPayloadCalls;
        bloc.add(const DiscoverySearchChanged('r'));
        bloc.add(const DiscoverySearchChanged('ro'));
        bloc.add(const DiscoverySearchChanged('royal '));
        await pumpEventQueue();
        expect(
          repository.searchPayloadCalls,
          callsAfterLocation,
          reason: 'nothing is requested while the user is still typing',
        );
        await Future<void>.delayed(
          DiscoveryFilterConstants.searchDebounce +
              const Duration(milliseconds: 50),
        );
        await pumpEventQueue();
        expect(repository.searchPayloadCalls, callsAfterLocation + 1);
      },
      wait: const Duration(milliseconds: 600),
      verify: (bloc) {
        expect(repository.lastQuery, 'royal');
        expect(bloc.state.filters.query, 'royal');
        expect(bloc.state.searchQuery, 'royal ');
      },
    );

    blocTest<DiscoveryBloc, DiscoveryState>(
      'repeating the active query does not refetch',
      build: bloc,
      seed: () => DiscoveryState(
        latitude: 24.7,
        longitude: 46.6,
        filters: const DiscoveryFilters(query: 'royal'),
      ),
      act: (bloc) => bloc.add(const DiscoverySearchChanged('royal')),
      wait:
          DiscoveryFilterConstants.searchDebounce +
          const Duration(milliseconds: 50),
      verify: (_) => expect(repository.searchPayloadCalls, 0),
    );
  });
}
