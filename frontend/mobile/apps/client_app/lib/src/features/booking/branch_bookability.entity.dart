import 'package:core/core.dart';

/// Whether a client can start a booking on a branch profile.
///
/// A booking needs a service to pick and someone to serve it: a chair to sit
/// in, or a stylist to choose (also the only way to book at home).
abstract final class BranchBookability {
  static bool isBookable(BranchDetailDto detail) =>
      detail.services.isNotEmpty &&
      (detail.chairsCount > 0 || detail.barbers.isNotEmpty);
}
