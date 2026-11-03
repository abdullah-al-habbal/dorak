import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/staff/business_staff.state.dart';

class BusinessStaffBloc extends Cubit<BusinessStaffState> {
  BusinessStaffBloc(this._staff, this._activation)
    : super(BusinessStaffState());

  final BranchStaffRepository _staff;
  final ManagedBarberRepository _activation;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final page = await _staff.getStaff();
      if (isClosed) return;
      emit(state.copyWith(loading: false, staff: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Activates a deactivated stylist or deactivates an active one, then
  /// reloads so the list shows the status the backend stored.
  Future<void> toggle(StaffMemberDto member) async {
    if (state.togglingId != null) return;
    emit(state.copyWith(togglingId: member.id, clearError: true));
    try {
      if (member.isActive) {
        await _activation.deactivateBarber(member.id);
      } else {
        await _activation.activateBarber(member.id);
      }
      if (isClosed) return;
      emit(state.copyWith(clearToggling: true));
      await load();
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearToggling: true, error: error));
    }
  }
}
