import 'package:equatable/equatable.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up_step.entity.dart';

class StylistSignUpState extends Equatable {
  StylistSignUpState({
    this.step = StylistSignUpStep.form,
    this.email = '',
    this.onboardingToken,
    this.isSubmitting = false,
    this.codeResent = false,
    this.error,
    Map<String, List<String>> fieldErrors = const {},
  }) : fieldErrors = Map.unmodifiable(fieldErrors);

  final StylistSignUpStep step;
  final String email;

  final String? onboardingToken;
  final bool isSubmitting;
  final bool codeResent;
  final Object? error;
  final Map<String, List<String>> fieldErrors;

  bool hasFieldError(String field) => fieldErrors.containsKey(field);

  StylistSignUpState copyWith({
    StylistSignUpStep? step,
    String? email,
    String? onboardingToken,
    bool? isSubmitting,
    bool? codeResent,
    Object? error,
    bool clearError = false,
    Map<String, List<String>>? fieldErrors,
  }) => StylistSignUpState(
    step: step ?? this.step,
    email: email ?? this.email,
    onboardingToken: onboardingToken ?? this.onboardingToken,
    isSubmitting: isSubmitting ?? this.isSubmitting,
    codeResent: codeResent ?? this.codeResent,
    error: clearError ? null : error ?? this.error,
    fieldErrors: clearError ? const {} : fieldErrors ?? this.fieldErrors,
  );

  @override
  List<Object?> get props => [
    step,
    email,
    onboardingToken,
    isSubmitting,
    codeResent,
    error,
    fieldErrors,
  ];
}
