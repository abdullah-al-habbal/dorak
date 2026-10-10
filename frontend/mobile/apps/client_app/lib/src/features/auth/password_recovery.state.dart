import 'package:equatable/equatable.dart';

import 'package:client_app/src/features/auth/recovery_signal.entity.dart';

class PasswordRecoveryState extends Equatable {
  PasswordRecoveryState({
    this.email = '',
    this.code = '',
    this.isSubmitting = false,
    this.error,
    Map<String, List<String>> fieldErrors = const {},
    this.signal = RecoverySignal.none,
  }) : fieldErrors = Map<String, List<String>>.unmodifiable(
         Map<String, List<String>>.fromEntries(
           fieldErrors.entries.map(
             (entry) =>
                 MapEntry(entry.key, List<String>.unmodifiable(entry.value)),
           ),
         ),
       );

  final String email;
  final String code;
  final bool isSubmitting;
  final Object? error;
  final Map<String, List<String>> fieldErrors;
  final RecoverySignal signal;

  bool get hasCode => code.length == 6;

  bool get isCodeRejected => fieldErrors.containsKey('code');

  String? firstErrorFor(String field) {
    final messages = fieldErrors[field];
    if (messages == null || messages.isEmpty) return null;
    return messages.first;
  }

  PasswordRecoveryState copyWith({
    String? email,
    String? code,
    bool? isSubmitting,
    Object? error,
    bool clearError = false,
    Map<String, List<String>>? fieldErrors,
    bool clearFieldErrors = false,
    RecoverySignal? signal,
  }) {
    return PasswordRecoveryState(
      email: email ?? this.email,
      code: code ?? this.code,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: clearError ? null : error ?? this.error,
      fieldErrors: clearFieldErrors
          ? const {}
          : fieldErrors ?? this.fieldErrors,
      signal: signal ?? this.signal,
    );
  }

  @override
  List<Object?> get props => [
    email,
    code,
    isSubmitting,
    error,
    fieldErrors,
    signal,
  ];
}
