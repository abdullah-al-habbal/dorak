/// Barber-initiated booking transitions dispatched to the operations API.
enum BarberBookingAction {
  accept,
  start,
  complete,
  noShow;

  String get value => switch (this) {
    BarberBookingAction.accept => 'accept',
    BarberBookingAction.start => 'start',
    BarberBookingAction.complete => 'complete',
    BarberBookingAction.noShow => 'no_show',
  };
}
