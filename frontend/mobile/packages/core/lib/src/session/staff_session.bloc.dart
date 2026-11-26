import 'package:bloc/bloc.dart';

import 'package:core/src/network/exceptions/api.exception.dart';
import 'package:core/src/network/exceptions/api_error_code_constants.entity.dart';
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

  /// Revokes the server token best-effort, then always drops the local one:
  /// an unreachable server must never keep a stylist signed in.
  Future<void> logout() async {
    try {
      await _repository.logout();
    } catch (_) {}
    await _tokenStorage.clear();
    emit(const StaffSessionState(status: StaffAuthStatus.guest));
  }

  /// Swaps the stored token for a fresh one. Returns whether it was renewed;
  /// a failure keeps the current session untouched.
  Future<bool> refresh() async {
    if (!state.isAuthenticated) return false;
    try {
      await _tokenStorage.write(await _repository.refreshToken());
      return true;
    } catch (_) {
      return false;
    }
  }

  /// The API stopped accepting the session. [code] is the code of that answer:
  /// an inactive account is kept as the reason. A plain sign-out never erases a
  /// reason that is already there.
  Future<void> unauthorized([String? code]) async {
    if (state.hasEndReason) return;
    if (code == ApiErrorCodeConstants.apiErrorCodeAccountNotActive) {
      return _endWithReason(
        ApiErrorCodeConstants.apiErrorCodeAccountNotActive,
        'Account not active',
      );
    }
    await _tokenStorage.clear();
    if (state.hasEndReason) return;
    emit(const StaffSessionState(status: StaffAuthStatus.guest));
  }

  /// Ends a session because its brand was suspended. It replaces the vaguer
  /// "not active" reason, never a ban, and does nothing to a session that
  /// already ended without a reason (the user signed out).
  Future<void> brandSuspended() async {
    if (state.isBanned || (!state.isAuthenticated && !state.hasEndReason)) {
      return;
    }
    await _endWithReason(
      ApiErrorCodeConstants.apiErrorCodeBrandSuspended,
      'Brand suspended',
    );
  }

  /// Ends the session of a banned account and keeps the reason in the state.
  Future<void> accountBanned() => _endWithReason(
    ApiErrorCodeConstants.apiErrorCodeAccountBanned,
    'Account suspended',
  );

  /// Emits the reason before clearing, so a signal that arrives while the token
  /// is being cleared already sees it.
  Future<void> _endWithReason(String code, String message) async {
    emit(
      StaffSessionState(
        status: StaffAuthStatus.guest,
        error: ApiException(statusCode: 403, code: code, message: message),
      ),
    );
    await _tokenStorage.clear();
  }
}
