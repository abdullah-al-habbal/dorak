/// One-time code shape shared by every verification and recovery flow.
class AuthCodeConstants {
  const AuthCodeConstants._();

  static const int codeLength = 6;
  static const int resendCooldownSeconds = 60;
}
