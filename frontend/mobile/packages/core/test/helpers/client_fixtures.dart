import 'package:core/core.dart';

/// Shared client DTOs for the fake repositories.
class ClientFixtures {
  const ClientFixtures._();

  static const ClientDto authClient = ClientDto(
    id: 'uuid-1',
    name: 'Sara',
    email: 'sara@example.com',
    phone: null,
  );

  static const ClientDto profileClient = ClientDto(
    id: 'uuid-1',
    name: 'Sara',
    email: 'sara@example.com',
    phone: '+966500000001',
  );
}
