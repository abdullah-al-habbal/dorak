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

  bool get isBanned {
    final failure = error;
    return status == StaffAuthStatus.guest &&
        failure is ApiException &&
        failure.code == ApiErrorCodeConstants.apiErrorCodeAccountBanned;
  }

  @override
  List<Object?> get props => [status, isSubmitting, error];
}
