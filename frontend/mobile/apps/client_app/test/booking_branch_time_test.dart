import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'package:client_app/src/features/booking/widgets/booking_card_header.widget.dart';

void main() {
  setUpAll(initializeDateFormatting);

  // BG-55: 01:30 UTC is 07:00 at a branch 330 minutes ahead, on any device.
  testWidgets('a booking card shows the time on the branch clock', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: BookingCardHeader(
            booking: BookingDto(
              id: 'booking-1',
              startsAt: DateTime.utc(2026, 12, 2, 1, 30),
              utcOffsetMinutes: 330,
              status: BookingStatus.pending,
            ),
            localeCode: 'en',
            statusLabel: 'Pending',
          ),
        ),
      ),
    );

    expect(find.textContaining('07:00'), findsOneWidget);
  });
}
