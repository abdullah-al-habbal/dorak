import 'package:core/core.dart';

import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/profile/discovery_preferences.bloc.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeClientInteractionRepository repository;
  late FakeBrandRepository brands;
  late DiscoveryPreferencesCubit cubit;

  setUp(() {
    repository = FakeClientInteractionRepository();
    brands = FakeBrandRepository();
    cubit = DiscoveryPreferencesCubit(repository, brands);
  });

  tearDown(() => cubit.close());

  test('load reads the stored preferences', () async {
    await cubit.load();

    expect(cubit.state.preferences?.defaultRadiusKm, 10);
  });

  test('save sends only the changed preference values', () async {
    await cubit.load();

    await cubit.save(defaultRadiusKm: 25);

    expect(repository.lastPreferenceValues, {'default_radius_km': 25.0});
    expect(cubit.state.preferences?.defaultRadiusKm, 25);
    expect(cubit.state.saved, isTrue);
  });

  test('clearing hidden brands sends an empty list', () async {
    await cubit.load();

    await cubit.save(hiddenBrandIds: const []);

    expect(repository.lastPreferenceValues, {'hidden_brand_ids': <String>[]});
  });

  test('a save with nothing to change makes no request', () async {
    await cubit.load();

    await cubit.save();

    expect(repository.lastPreferenceValues, isNull);
  });

  test('a failed save keeps the loaded preferences and the error', () async {
    await cubit.load();
    repository.error = Exception('offline');

    await cubit.save(allowsUnavailableResults: true);

    expect(cubit.state.error, isNotNull);
    expect(cubit.state.preferences, isNotNull);
  });

  test(
    'loadBrands lists the public brands and keeps the preferences',
    () async {
      await cubit.load();

      await cubit.loadBrands();

      expect(cubit.state.brands.map((brand) => brand.id), [
        'brand-1',
        'brand-2',
      ]);
      expect(brands.lastPerPage, 100);
      expect(cubit.state.preferences, isNotNull);
      expect(cubit.state.isLoadingBrands, isFalse);
    },
  );

  test('a failed brand load records the error without losing data', () async {
    await cubit.load();
    brands.error = Exception('offline');

    await cubit.loadBrands();

    expect(cubit.state.brandsError, isNotNull);
    expect(cubit.state.preferences, isNotNull);
  });

  test('toggleBrand hides a visible brand and sends the full list', () async {
    await cubit.load();
    await cubit.loadBrands();

    await cubit.toggleBrand('brand-1');

    expect(repository.lastPreferenceValues, {
      'hidden_brand_ids': ['brand-1'],
    });
    expect(cubit.state.preferences?.hiddenBrandIds, ['brand-1']);
    expect(cubit.state.brands, isNotEmpty);
  });

  test('toggleBrand shows an already hidden brand again', () async {
    repository.preferences = const DiscoveryPreferenceDto(
      id: 'pref-1',
      hiddenBrandIds: ['brand-1', 'brand-2'],
    );
    await cubit.load();

    await cubit.toggleBrand('brand-1');

    expect(repository.lastPreferenceValues, {
      'hidden_brand_ids': ['brand-2'],
    });
  });
}
