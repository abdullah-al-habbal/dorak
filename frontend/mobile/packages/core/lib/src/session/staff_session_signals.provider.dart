import 'dart:async';

import 'package:core/src/network/api.client.dart';
import 'package:core/src/session/staff_session.bloc.dart';

/// Ends the staff session when the API reports it dead: an expired or rejected
/// token, or a banned account. Both then run the app's [onSessionEnded]
/// teardown (push, realtime, route to login).
class StaffSessionSignals {
  StaffSessionSignals({
    required ApiClient client,
    required StaffSessionBloc session,
    required Future<void> Function() onSessionEnded,
  }) {
    _subscriptions = [
      client.unauthorizedStream.listen(
        (_) => unawaited(_end(session.unauthorized, onSessionEnded)),
      ),
      client.accountBannedStream.listen(
        (_) => unawaited(_end(session.accountBanned, onSessionEnded)),
      ),
    ];
  }

  late final List<StreamSubscription<void>> _subscriptions;

  Future<void> _end(
    Future<void> Function() endSession,
    Future<void> Function() onSessionEnded,
  ) async {
    // A token store that fails to clear must not keep push and realtime alive.
    try {
      await endSession();
    } finally {
      await onSessionEnded();
    }
  }

  Future<void> dispose() async {
    for (final subscription in _subscriptions) {
      await subscription.cancel();
    }
  }
}
