class BarberAuthEndpoints {
  BarberAuthEndpoints._();

  static const login = '/barber/login';
  static const register = '/barber/register';
  static const sendEmailVerification = '/barber/email/verify/send';
  static const verifyEmail = '/barber/email/verify';
  static const logout = '/barber/logout';
  static const refreshToken = '/barber/refresh-token';
  static const forgotPassword = '/barber/forgot-password';
  static const resetPassword = '/barber/reset-password';
}
