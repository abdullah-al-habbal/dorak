import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/display_price.dto.dart';

part 'booking_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: true)
class BookingServiceDto {
  final String id;
  final String name;
  final int? priceAmountMinor;
  final int? duration;

  /// Who offers it on a menu (`brand` | `branch` | `barber`), when known.
  final String? owner;

  final DisplayPriceDto? displayPrice;
  @JsonKey(defaultValue: false)
  final bool conversionUnavailable;
  @JsonKey(defaultValue: false)
  final bool isDualPriceDisplayEnabled;

  const BookingServiceDto({
    required this.id,
    required this.name,
    this.priceAmountMinor,
    this.duration,
    this.owner,
    this.displayPrice,
    this.conversionUnavailable = false,
    this.isDualPriceDisplayEnabled = false,
  });

  factory BookingServiceDto.fromJson(Map<String, dynamic> json) =>
      _$BookingServiceDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingServiceDtoToJson(this);
}
