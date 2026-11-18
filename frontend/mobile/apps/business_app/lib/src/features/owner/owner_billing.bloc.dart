import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/owner/owner_billing.state.dart';

/// Read-only plan and payouts (billing is managed on the web).
class OwnerBillingCubit extends Cubit<OwnerBillingState> {
  OwnerBillingCubit(this._owner) : super(OwnerBillingState());

  final OwnerRepository _owner;

  Future<void> load() async {
    emit(OwnerBillingState(loading: true));
    try {
      final subscriptions = await _owner.getSubscriptions();
      final payouts = await _owner.getPayouts();
      if (isClosed) return;
      emit(
        OwnerBillingState(subscriptions: subscriptions, payouts: payouts.data),
      );
    } catch (error) {
      if (isClosed) return;
      emit(OwnerBillingState(error: error));
    }
  }
}
