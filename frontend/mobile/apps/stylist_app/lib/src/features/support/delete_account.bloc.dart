import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/support/delete_account.event.dart';
import 'package:stylist_app/src/features/support/delete_account.state.dart';

/// Deletes the signed-in stylist's account after a password check. The backend keeps
/// bookings and reviews, removes the personal data and refuses while a booking is open
/// or the stylist still works for a brand or branch.
class DeleteAccountBloc extends Bloc<DeleteAccountEvent, DeleteAccountState> {
  DeleteAccountBloc(this._repository) : super(const DeleteAccountState()) {
    on<DeleteAccountSubmitted>(_onSubmitted);
  }

  final StaffAccountRepository _repository;

  Future<void> _onSubmitted(
    DeleteAccountSubmitted event,
    Emitter<DeleteAccountState> emit,
  ) async {
    if (state.isSubmitting || event.password.isEmpty) return;
    emit(state.copyWith(isSubmitting: true, clearError: true));
    try {
      await _repository.deleteAccount(event.password);
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, succeeded: true));
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }
}
