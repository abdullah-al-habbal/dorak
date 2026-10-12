import 'package:bloc/bloc.dart';

import 'package:core/src/network/repositories/staff_auth.repository.dart';
import 'package:core/src/session/staff_session.state.dart';
import 'package:core/src/storage/token.storage.dart';

class StaffSessionBloc extends Cubit<StaffSessionState> {
  StaffSessionBloc(this._repository, this._tokenStorage)
    : super(const StaffSessionState());

  final StaffAuthRepository _repository;
  final TokenStorage _tokenStorage;

  Future<void> restore() async {
    try {
      final token = await _tokenStorage.read();
      emit(
        StaffSessionState(
          status: token == null
              ? StaffAuthStatus.guest
              : StaffAuthStatus.authenticated,
        ),
      );
    } catch (error) {
      emit(StaffSessionState(status: StaffAuthStatus.guest, error: error));
    }
  }

  Future<void> login({required String email, required String password}) async {
    if (state.isSubmitting) return;
    emit(
      const StaffSessionState(
        status: StaffAuthStatus.guest,
        isSubmitting: true,
      ),
    );
    try {
      final token = await _repository.login(email: email, password: password);
      await _tokenStorage.write(token);
      emit(const StaffSessionState(status: StaffAuthStatus.authenticated));
    } catch (error) {
      emit(StaffSessionState(status: StaffAuthStatus.guest, error: error));
    }
  }

  Future<void> logout() async {
    await _tokenStorage.clear();
    emit(const StaffSessionState(status: StaffAuthStatus.guest));
  }

  Future<void> unauthorized() async {
    await _tokenStorage.clear();
    emit(const StaffSessionState(status: StaffAuthStatus.guest));
  }
}
