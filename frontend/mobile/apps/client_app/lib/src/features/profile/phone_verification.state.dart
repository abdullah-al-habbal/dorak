import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

import 'package:client_app/src/features/profile/phone_verification_status.entity.dart';

class PhoneVerificationState extends Equatable {
  const PhoneVerificationState({
    required this.phone,
    this.status = PhoneVerificationStatus.idle,
    this.client,
    this.error,
  });

  final String phone;
  final PhoneVerificationStatus status;
  final ClientDto? client;
  final Object? error;

  bool get isBusy =>
      status == PhoneVerificationStatus.requesting ||
      status == PhoneVerificationStatus.verifying;

  @override
  List<Object?> get props => [phone, status, client, error];
}
