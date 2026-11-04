import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

enum SocialLoginStatus {
  idle,
  authenticating,
  credentialReady,
  cancelled,
  failed,
}

class SocialLoginState extends Equatable {
  const SocialLoginState({
    this.status = SocialLoginStatus.idle,
    this.provider,
    this.token,
  });

  final SocialLoginStatus status;
  final SocialAuthProvider? provider;
  final String? token;

  bool get isAuthenticating => status == SocialLoginStatus.authenticating;

  @override
  List<Object?> get props => [status, provider, token];
}
