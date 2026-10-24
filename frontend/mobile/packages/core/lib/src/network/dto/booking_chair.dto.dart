import 'package:json_annotation/json_annotation.dart';

part 'booking_chair.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: true)
class BookingChairDto {
  final String id;
  final String? label;
  final String? status;

  const BookingChairDto({required this.id, this.label, this.status});

  factory BookingChairDto.fromJson(Map<String, dynamic> json) =>
      _$BookingChairDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingChairDtoToJson(this);
}
