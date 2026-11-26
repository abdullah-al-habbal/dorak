import 'package:equatable/equatable.dart';

import 'package:core/src/network/exceptions/api.exception.dart';
import 'package:core/src/network/exceptions/api_error_code_constants.entity.dart';

enum StaffAuthStatus { unknown, guest, authenticated }

class StaffSessionState extends Equatable {
  const StaffSessionState({
    this.status = StaffAuthStatus.unknown,
    this.isSubmitting = false,
    this.error,
  });

  final StaffAuthStatus status;
  final bool isSubmitting;
  final Object? error;

  bool get isAuthenticated => status == StaffAuthStatus.authenticated;

  /// Why a signed-out session carries an error: the API code, when it has one.
  String? get _guestErrorCode {
    final failure = error;
    return status == StaffAuthStatus.guest && failure is ApiException
        ? failure.code
        : null;
  }

  bool get isBanned =>
      _guestErrorCode == ApiErrorCodeConstants.apiErrorCodeAccountBanned;

  bool get isBrandSuspended =>
      _guestErrorCode == ApiErrorCodeConstants.apiErrorCodeBrandSuspended;

  /// The login screen has something to explain, which a later plain sign-out
  /// must not erase.
  bool get hasEndReason =>
      isBanned ||
      isBrandSuspended ||
      _guestErrorCode == ApiErrorCodeConstants.apiErrorCodeAccountNotActive;

  @override
  List<Object?> get props => [status, isSubmitting, error];
}
