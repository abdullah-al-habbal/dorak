import 'package:flutter_test/flutter_test.dart';
import 'package:core/core.dart';

import 'package:client_app/src/features/booking/booking_refresh.bloc.dart';
import 'package:client_app/src/features/profile/profile_edit.bloc.dart';
import 'package:client_app/src/features/profile/saved_addresses.bloc.dart';

import 'helpers/fakes.dart';

void main() {
  test('ProfileEditCubit persists profile edits', () async {
    final repository = FakeProfileRepository();
    final cubit = ProfileEditCubit(repository);

    await cubit.save(name: 'Sara', phone: '+963900000000');

    expect(cubit.state.saved, isTrue);
    expect(repository.lastName, 'Sara');
    await cubit.close();
  });

  test('SavedAddressesCubit saves and deletes an address', () async {
    final preferences = InMemoryAppPreferences();
    final cubit = SavedAddressesCubit(preferences);
    const address = SavedAddress(
      street: 'Main Street',
      building: '12',
      unit: '3A',
      latitude: 33.5,
      longitude: 36.3,
    );

    await cubit.save(address);
    expect(cubit.state.addresses, [address]);

    await cubit.delete(address);
    expect(cubit.state.addresses, isEmpty);
    await cubit.close();
  });

  test(
    'BookingRefreshCubit emits state instead of returning a booking',
    () async {
      final repository = FakeBookingRepository();
      final cubit = BookingRefreshCubit(repository, testBooking());

      await cubit.refresh();

      expect(cubit.state.booking.id, 'booking-1');
      expect(repository.getBookingCalls, 1);
      await cubit.close();
    },
  );
}
