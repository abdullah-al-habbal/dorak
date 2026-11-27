import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

// BG-56: the slot calls must send the calendar date the user picked. The date
// picker returns local midnight, so a conversion to UTC only shows east of UTC:
// Mobile CI also runs this file with TZ=Asia/Damascus.
void main() {
  final picked = DateTime(2026, 12, 2);

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
  });

  test('getBarberSlots sends the picked date', () async {
    final date = await sentDate(
      (client) => DioBookingRepository(client).getBarberSlots(
        'barber-1',
        date: picked,
        serviceIds: const ['service-1'],
      ),
    );

    expect(date, '2026-12-02');
  });
}
