import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/profile/discovery_preferences.bloc.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeClientInteractionRepository repository;
  late DiscoveryPreferencesCubit cubit;

  setUp(() {
    repository = FakeClientInteractionRepository();
    cubit = DiscoveryPreferencesCubit(repository);
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
}
