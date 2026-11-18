/// Which kind of account is signed in. Both use the same token storage; the role
/// decides which API surface and which shell the app opens.
enum AppRole {
  branch('branch'),
  owner('owner');

  const AppRole(this.wire);

  final String wire;

  static AppRole? fromWire(String? value) {
    for (final role in values) {
      if (role.wire == value) return role;
    }
    return null;
  }
}
