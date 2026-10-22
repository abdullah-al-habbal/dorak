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

  group('ProfileEditCubit phone change', () {
    test('a changed phone is not patched and asks for verification', () async {
      final repository = FakeProfileRepository();
      final cubit = ProfileEditCubit(repository, initialPhone: '+963900000000');

      await cubit.save(name: 'Sara', phone: ' +963911111111 ');

      expect(cubit.state.saved, isTrue);
      expect(cubit.state.phoneToVerify, '+963911111111');
      expect(repository.requestOtpCalls, 0);
      await cubit.close();
    });

    test('an unchanged phone needs no verification', () async {
      final cubit = ProfileEditCubit(
        FakeProfileRepository(),
        initialPhone: '+963900000000',
      );

      await cubit.save(name: 'Sara', phone: '+963900000000');

      expect(cubit.state.phoneToVerify, isNull);
      await cubit.close();
    });
  });

  group('ProfileEditCubit email change', () {
    test('a new email is sent and requires verification', () async {
      final repository = FakeProfileRepository();
      final cubit = ProfileEditCubit(
        repository,
        initialEmail: 'sara@example.com',
      );

      await cubit.save(
        name: 'Sara',
        phone: '+963900000000',
        email: ' New@Example.com ',
      );

      expect(repository.lastEmail, 'New@Example.com');
      expect(cubit.state.saved, isTrue);
      expect(cubit.state.client?.emailVerified, isFalse);
      expect(cubit.state.needsEmailVerification, isTrue);
      await cubit.close();
    });

    test('an unchanged email is not sent and needs no verification', () async {
      final repository = FakeProfileRepository();
      final cubit = ProfileEditCubit(
        repository,
        initialEmail: 'sara@example.com',
      );

      await cubit.save(
        name: 'Sara',
        phone: '+963900000000',
        email: 'SARA@example.com',
      );

      expect(repository.lastEmail, isNull);
      expect(cubit.state.saved, isTrue);
      expect(cubit.state.needsEmailVerification, isFalse);
      await cubit.close();
    });

    test('a failed save surfaces the error without verification', () async {
      final repository = FakeProfileRepository()
        ..updateError = const ApiException(
          statusCode: 500,
          code: 'SERVER_ERROR',
          message: 'boom',
        );
      final cubit = ProfileEditCubit(repository, initialEmail: 'a@b.co');

      await cubit.save(name: 'Sara', phone: '', email: 'c@d.co');

      expect(cubit.state.saved, isFalse);
      expect(cubit.state.error, isA<ApiException>());
      expect(cubit.state.needsEmailVerification, isFalse);
      await cubit.close();
    });
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
