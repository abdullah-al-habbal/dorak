import 'dart:async';

import 'package:core/src/network/api.client.dart';
import 'package:core/src/session/staff_session.bloc.dart';

/// Ends the staff session when the API reports it dead: an expired or rejected
/// token, an inactive account or a banned one, and on [brandSuspended]. Each then
/// runs the app's [onSessionEnded] teardown (push, realtime, route to login).
class StaffSessionSignals {
  StaffSessionSignals({
    required ApiClient client,
    required StaffSessionBloc session,
    required Future<void> Function() onSessionEnded,
  }) : _session = session,
       _onSessionEnded = onSessionEnded {
    _subscriptions = [
      client.unauthorizedStream.listen(
        (code) =>
            unawaited(_end(() => session.unauthorized(code), onSessionEnded)),
      ),
      client.accountBannedStream.listen(
        (_) => unawaited(_end(session.accountBanned, onSessionEnded)),
      ),
    ];
  }

  late final List<StreamSubscription<void>> _subscriptions;

  final StaffSessionBloc _session;
  final Future<void> Function() _onSessionEnded;

  /// For the app that learns its brand was suspended and cannot keep working.
  Future<void> brandSuspended() =>
      _end(_session.brandSuspended, _onSessionEnded);

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
