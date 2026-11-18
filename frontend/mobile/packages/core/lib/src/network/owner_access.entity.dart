import 'package:core/src/network/dto/owner_profile.dto.dart';

/// What `GET /owner/me` means for the signed-in client.
sealed class OwnerAccess {
  const OwnerAccess();
}

/// The client owns at least one brand: the owner experience can open.
final class OwnerAccessGranted extends OwnerAccess {
  const OwnerAccessGranted(this.profile);

  final OwnerProfileDto profile;
}

/// An ordinary client with no brand. The app offers the web registration
/// (`LegalLinks.ownerRegistration`); it is not an error.
final class OwnerAccessNoBrand extends OwnerAccess {
  const OwnerAccessNoBrand();
}
