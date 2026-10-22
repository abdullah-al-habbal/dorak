import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('opened notifications are routed through the target resolver', () async {
    final service = PushNotificationService(
      ApiClient(
        baseUrl: 'https://example.test',
        tokenProvider: () async => null,
      ),
    );
    final targets = <NotificationTarget>[];
    final subscription = service.opened.listen(targets.add);

    service.handleOpenedData({'type': 'review_request', 'booking_id': 'b-1'});
    service.handleOpenedData({'type': 'invite', 'affiliation_id': 'a-1'});
    await Future<void>.delayed(Duration.zero);

    expect(targets.map((t) => t.kind), [
      NotificationTargetKind.review,
      NotificationTargetKind.invite,
    ]);
    expect(targets.first.bookingId, 'b-1');
    expect(service.takeInitialTarget(), isNull);

    await subscription.cancel();
    await service.dispose();
  });
}
