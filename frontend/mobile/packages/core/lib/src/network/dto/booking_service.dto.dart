import 'package:json_annotation/json_annotation.dart';

part 'booking_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BookingServiceDto {
  final String id;
  final String name;
  final double? price;
  final int? duration;

  /// Who offers it on a menu (`brand` | `branch` | `barber`), when known.
  final String? owner;

  const BookingServiceDto({
    required this.id,
    required this.name,
    this.price,
    this.duration,
    this.owner,
  });

  factory BookingServiceDto.fromJson(Map<String, dynamic> json) =>
      _$BookingServiceDtoFromJson(json);
}
