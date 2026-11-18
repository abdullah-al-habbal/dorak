import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class OwnerBillingState extends Equatable {
  OwnerBillingState({
    this.loading = false,
    List<OwnerSubscriptionDto> subscriptions = const [],
    List<OwnerPayoutDto> payouts = const [],
    this.error,
  }) : subscriptions = List.unmodifiable(subscriptions),
       payouts = List.unmodifiable(payouts);

  final bool loading;
  final List<OwnerSubscriptionDto> subscriptions;
  final List<OwnerPayoutDto> payouts;
  final Object? error;

  @override
  List<Object?> get props => [loading, subscriptions, payouts, error];
}
