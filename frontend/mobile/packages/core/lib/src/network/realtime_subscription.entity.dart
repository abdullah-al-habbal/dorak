import 'package:laravel_reverb/laravel_reverb.dart';

class RealtimeSubscription {
  RealtimeSubscription(this._subscription);

  final Subscription _subscription;

  void cancel() => _subscription.cancel();
}
