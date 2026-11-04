import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/auth/social_credential.provider.dart';
import 'package:client_app/src/features/auth/social_login.event.dart';
import 'package:client_app/src/features/auth/social_login.state.dart';

class SocialLoginBloc extends Bloc<SocialLoginEvent, SocialLoginState> {
  SocialLoginBloc(this._credentials) : super(const SocialLoginState()) {
    on<SocialLoginStarted>(_onStarted);
  }

  final SocialCredentialProvider _credentials;

  Future<void> _onStarted(
    SocialLoginStarted event,
    Emitter<SocialLoginState> emit,
  ) async {
    if (state.isAuthenticating) return;
    if (!_credentials.supports(event.provider)) {
      emit(
        SocialLoginState(
          status: SocialLoginStatus.failed,
          provider: event.provider,
        ),
      );
      return;
    }
    emit(
      SocialLoginState(
        status: SocialLoginStatus.authenticating,
        provider: event.provider,
      ),
    );
    try {
      final token = await _credentials.obtainToken(event.provider);
      if (emit.isDone) return;
      final usable = token != null && token.isNotEmpty;
      emit(
        SocialLoginState(
          status: token == null
              ? SocialLoginStatus.cancelled
              : usable
              ? SocialLoginStatus.credentialReady
              : SocialLoginStatus.failed,
          provider: event.provider,
          token: usable ? token : null,
        ),
      );
    } catch (_) {
      if (emit.isDone) return;
      emit(
        SocialLoginState(
          status: SocialLoginStatus.failed,
          provider: event.provider,
        ),
      );
    }
  }
}
