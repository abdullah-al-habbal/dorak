import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/delete_account.event.dart';
import 'package:client_app/src/features/profile/delete_account.state.dart';

class DeleteAccountBloc extends Bloc<DeleteAccountEvent, DeleteAccountState> {
  DeleteAccountBloc(this._repository) : super(const DeleteAccountState()) {
    on<DeleteAccountSubmitted>(_onSubmitted);
  }

  final AuthRepository _repository;

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
