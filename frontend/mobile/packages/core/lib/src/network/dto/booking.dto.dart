import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/booking_status.entity.dart';
import 'package:core/src/network/dto/at_home_location.dto.dart';
import 'package:core/src/network/dto/booking_barber.dto.dart';
import 'package:core/src/network/dto/booking_chair.dto.dart';
import 'package:core/src/network/dto/booking_client.dto.dart';
import 'package:core/src/network/dto/booking_service.dto.dart';

part 'booking.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: true)
class BookingDto {
  final String id;
  final DateTime startsAt;
  final DateTime? endsAt;
  @JsonKey(name: 'booking_status', unknownEnumValue: BookingStatus.unknown)
  final BookingStatus status;
  @JsonKey(defaultValue: 'pay_at_salon')
  final String paymentMethod;
  @JsonKey(defaultValue: 'unpaid_in_person')
  final String paymentStatus;
  final bool? cancellationEligible;
  final DateTime? cancellationCutoffAt;
  final BookingChairDto? chair;
  final BookingBarberDto? barber;
  final BookingClientDto? client;
  final List<BookingServiceDto> services;
  final AtHomeLocationDto? homeAddress;
  final DateTime? createdAt;

  const BookingDto({
    required this.id,
    required this.startsAt,
    this.endsAt,
    required this.status,
    this.paymentMethod = 'pay_at_salon',
    this.paymentStatus = 'unpaid_in_person',
    this.cancellationEligible,
    this.cancellationCutoffAt,
    this.chair,
    this.barber,
    this.client,
    this.services = const [],
    this.homeAddress,
    this.createdAt,
  });

  factory BookingDto.fromJson(Map<String, dynamic> json) =>
      _$BookingDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingDtoToJson(this);
}
