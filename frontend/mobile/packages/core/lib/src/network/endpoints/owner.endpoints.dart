/// The brand owner's bearer routes (`/owner/*`); the owner signs in as a client.
class OwnerEndpoints {
  OwnerEndpoints._();

  static const String me = '/owner/me';
  static const String brands = '/owner/brands';
  static const String brandLogo = '/owner/brands/logo';
  static const String brand = '/owner/brands/{brand}';
  static const String brandResubmit = '/owner/brands/{brand}/resubmit';
  static const String branches = '/owner/branches';
  static const String branch = '/owner/branches/{branch}';
  static const String branchSwitchOn = '/owner/branches/{branch}/switch-on';
  static const String branchSwitchOff = '/owner/branches/{branch}/switch-off';
  static const String subscription = '/owner/subscription';
  static const String payouts = '/owner/payouts';
  static const String services = '/owner/services';
  static const String service = '/owner/services/{service}';
}
