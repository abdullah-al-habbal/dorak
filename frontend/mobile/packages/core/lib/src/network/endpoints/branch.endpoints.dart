class BranchEndpoints {
  BranchEndpoints._();

  static const String floorPlan = '/branches/{branch}/floor-plan';
  static const String slots = '/branches/{branch}/slots';
  static const String managedBarbers = '/branch/barbers';
  static const String activateBarber = '/branch/barbers/{barber}/activate';
  static const String deactivateBarber = '/branch/barbers/{barber}/deactivate';
  static const String profile = '/branch/profile';
  static const String floorPlanConfiguration = '/branch/floor-plan';
  static const String reviews = '/branch/reviews';
  static const String chairStatus = '/branch/chairs/{chair}/status';
}
