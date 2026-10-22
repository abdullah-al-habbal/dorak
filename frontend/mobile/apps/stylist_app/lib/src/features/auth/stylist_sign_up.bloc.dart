import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up.state.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up_step.entity.dart';

class StylistSignUpBloc extends Cubit<StylistSignUpState> {
  StylistSignUpBloc(this._repository) : super(StylistSignUpState());

  final BarberRegistrationRepository _repository;

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    required bool isFreelancer,
  }) async {
    if (state.isSubmitting) return;
    emit(state.copyWith(isSubmitting: true, clearError: true));
    try {
      final token = await _repository.register(
        name: name,
        email: email,
        password: password,
        passwordConfirmation: passwordConfirmation,
        isFreelancer: isFreelancer,
      );
      emit(
        state.copyWith(
          step: StylistSignUpStep.verifyEmail,
          email: email,
          onboardingToken: token,
          isSubmitting: false,
        ),
      );
    } on ValidationException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          error: error,
          fieldErrors: error.errors,
        ),
      );
    } catch (error) {
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }

  Future<void> verifyEmail(String code) async {
    if (state.isSubmitting) return;
    emit(state.copyWith(isSubmitting: true, clearError: true));
    try {
      await _repository.verifyEmail(code);
      emit(
        state.copyWith(step: StylistSignUpStep.pending, isSubmitting: false),
      );
    } on ValidationException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          error: error,
          fieldErrors: error.errors,
        ),
      );
    } catch (error) {
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }

  Future<void> resendCode() async {
    if (state.isSubmitting) return;
    emit(
      state.copyWith(isSubmitting: true, codeResent: false, clearError: true),
    );
    try {
      await _repository.sendEmailVerification();
      emit(state.copyWith(isSubmitting: false, codeResent: true));
    } catch (error) {
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }

  void skipVerification() =>
      emit(state.copyWith(step: StylistSignUpStep.pending, clearError: true));

  void reset() => emit(StylistSignUpState());
}
