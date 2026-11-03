import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:core/src/session/staff_session.bloc.dart';

/// Re-runs a router's redirect whenever the staff session changes, so a
/// logout, an expired token or a restored session moves the user immediately.
class StaffSessionRefresh extends ChangeNotifier {
  StaffSessionRefresh(StaffSessionBloc session) {
    _subscription = session.stream.listen((_) => notifyListeners());
  }

  late final StreamSubscription<Object?> _subscription;

  @override
  void dispose() {
    unawaited(_subscription.cancel());
    super.dispose();
  }
}
