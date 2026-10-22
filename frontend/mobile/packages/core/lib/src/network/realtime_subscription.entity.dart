import 'package:laravel_reverb/laravel_reverb.dart';

class RealtimeSubscription {
  RealtimeSubscription(Subscription subscription)
    : _cancel = subscription.cancel;

  /// Wraps a bare cancel callback, for transports (and test fakes) that have no
  /// Reverb [Subscription].
  RealtimeSubscription.fromCancel(this._cancel);

  final void Function() _cancel;

  void cancel() => _cancel();
}
