class OperationsEndpoints {
  OperationsEndpoints._();

  static const branchDashboard = '/branch/dashboard';
  static const branchBookings = '/branch/bookings';
  static const branchBookingStatus = '/branch/bookings/{booking}/status';
  static const branchChairs = '/branch/chairs';
  static const barberTodayAppointments = '/barber/appointments/today';
  static const barberWorkstationStatus = '/barber/workstation-status';
  static const barberBookingAccept = '/barber/bookings/{booking}/accept';
  static const barberBookingStart = '/barber/bookings/{booking}/start';
  static const barberBookingComplete = '/barber/bookings/{booking}/complete';
  static const barberBookingNoShow = '/barber/bookings/{booking}/no-show';
}
