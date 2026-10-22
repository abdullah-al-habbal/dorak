import 'package:equatable/equatable.dart';

sealed class PhoneVerificationEvent extends Equatable {
  const PhoneVerificationEvent();

  @override
  List<Object?> get props => [];
}

class PhoneVerificationRequested extends PhoneVerificationEvent {
  const PhoneVerificationRequested();
}

class PhoneVerificationSubmitted extends PhoneVerificationEvent {
  const PhoneVerificationSubmitted(this.code);

  final String code;

  @override
  List<Object?> get props => [code];
}
