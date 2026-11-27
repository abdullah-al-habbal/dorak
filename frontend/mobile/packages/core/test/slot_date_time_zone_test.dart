import 'dart:io';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

// BG-56: the slot calls must send the calendar date the user picked. The date
// picker returns local midnight, so the bug shows only east of UTC and CI (UTC)
// cannot see it. Skipped until fixed. Run it from packages/core with:
// REPRODUCE_BUGS=1 TZ=Asia/Damascus flutter test test/slot_date_time_zone_test.dart
void main() {
  final picked = DateTime(2026, 12, 2);
  final String? skip = Platform.environment['REPRODUCE_BUGS'] != '1'
      ? 'BG-56: the slot date is converted to UTC.'
      : picked.timeZoneOffset <= Duration.zero
      ? 'Needs a zone east of UTC, for example TZ=Asia/Damascus.'
      : null;

  Future<Object?> sentDate(Future<void> Function(ApiClient client) call) async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(options, data: successEnvelope(data: <Object?>[]));
      },
    );
    await call(clientWith(fake));
    return captured.queryParameters['date'];
  }

  test('getBranchSlots sends the picked date', () async {
    final date = await sentDate(
      (client) => DioBranchRepository(client).getBranchSlots(
        'branch-1',
        date: picked,
        serviceIds: const ['service-1'],
      ),
    );

    expect(date, '2026-12-02');
  }, skip: skip);

  test('getBarberSlots sends the picked date', () async {
    final date = await sentDate(
      (client) => DioBookingRepository(client).getBarberSlots(
        'barber-1',
        date: picked,
        serviceIds: const ['service-1'],
      ),
    );

    expect(date, '2026-12-02');
  }, skip: skip);
}
