import 'package:bloc/bloc.dart';

import 'package:core/src/network/repositories/staff_auth.repository.dart';
import 'package:core/src/session/staff_password_reset.state.dart';

/// Email → code + new password → done. The code is only ever checked together
/// with the new password, so a wrong code costs nothing but an attempt.
class StaffPasswordResetBloc extends Cubit<StaffPasswordResetState> {
  StaffPasswordResetBloc(this._repository)
    : super(const StaffPasswordResetState());

  final StaffAuthRepository _repository;

  /// Sends (or re-sends) the code and moves to the code step.
  Future<void> requestCode(String email) async {
    if (state.isSubmitting) return;
    emit(state.copyWith(isSubmitting: true, clearError: true));
    try {
      await _repository.forgotPassword(email);
      if (isClosed) return;
      emit(
        StaffPasswordResetState(
          step: StaffPasswordResetStep.code,
          email: email,
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }

  Future<void> resetPassword({
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    if (state.isSubmitting || state.step != StaffPasswordResetStep.code) return;
    emit(state.copyWith(isSubmitting: true, clearError: true));
    try {
      await _repository.resetPassword(
        email: state.email,
        code: code,
        password: password,
        passwordConfirmation: passwordConfirmation,
      );
      if (isClosed) return;
      emit(
        state.copyWith(step: StaffPasswordResetStep.done, isSubmitting: false),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }

  void restart() => emit(const StaffPasswordResetState());
}
