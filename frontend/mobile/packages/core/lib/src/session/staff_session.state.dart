import 'package:equatable/equatable.dart';

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

  @override
  List<Object?> get props => [status, isSubmitting, error];
}
