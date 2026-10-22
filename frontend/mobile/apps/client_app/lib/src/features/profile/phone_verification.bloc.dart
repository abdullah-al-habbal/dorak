import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/phone_verification.event.dart';
import 'package:client_app/src/features/profile/phone_verification.state.dart';
import 'package:client_app/src/features/profile/phone_verification_status.entity.dart';

class PhoneVerificationBloc
    extends Bloc<PhoneVerificationEvent, PhoneVerificationState> {
  PhoneVerificationBloc(this._profiles, String phone)
    : super(PhoneVerificationState(phone: phone)) {
    on<PhoneVerificationRequested>(_onRequested);
    on<PhoneVerificationSubmitted>(_onSubmitted);
  }

  final ProfileRepository _profiles;

  Future<void> _onRequested(
    PhoneVerificationRequested event,
    Emitter<PhoneVerificationState> emit,
  ) async {
    if (state.isBusy) return;
    emit(
      PhoneVerificationState(
        phone: state.phone,
        status: PhoneVerificationStatus.requesting,
      ),
    );
    try {
      await _profiles.requestPhoneOtp(state.phone);
      if (emit.isDone) return;
      emit(
        PhoneVerificationState(
          phone: state.phone,
          status: PhoneVerificationStatus.codeSent,
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(
        PhoneVerificationState(
          phone: state.phone,
          status: PhoneVerificationStatus.requestFailed,
          error: error,
        ),
      );
    }
  }

  Future<void> _onSubmitted(
    PhoneVerificationSubmitted event,
    Emitter<PhoneVerificationState> emit,
  ) async {
    if (state.isBusy) return;
    emit(
      PhoneVerificationState(
        phone: state.phone,
        status: PhoneVerificationStatus.verifying,
      ),
    );
    try {
      final client = await _profiles.verifyPhoneOtp(event.code);
      if (emit.isDone) return;
      emit(
        PhoneVerificationState(
          phone: state.phone,
          status: PhoneVerificationStatus.verified,
          client: client,
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(
        PhoneVerificationState(
          phone: state.phone,
          status: PhoneVerificationStatus.verifyFailed,
          error: error,
        ),
      );
    }
  }
}
