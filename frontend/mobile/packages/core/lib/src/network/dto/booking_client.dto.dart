import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/client_reputation.dto.dart';

part 'booking_client.dto.g.dart';

/// The client on a booking as staff (branch, barber) see it. Client-facing
/// booking payloads never include it.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: true)
class BookingClientDto {
  final String id;
  final String? name;
  final String? phone;
  final ClientReputationDto reputation;

  const BookingClientDto({
    required this.id,
    this.name,
    this.phone,
    this.reputation = const ClientReputationDto(),
  });

  factory BookingClientDto.fromJson(Map<String, dynamic> json) =>
      _$BookingClientDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingClientDtoToJson(this);
}
