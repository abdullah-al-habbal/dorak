import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/barber_status.entity.dart';

part 'staff_member.dto.g.dart';

/// A stylist of the branch in `GET /branch/barbers`.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class StaffMemberDto {
  final String id;
  final String name;
  final String? phone;
  final String? email;
  @JsonKey(unknownEnumValue: BarberStatus.pending)
  final BarberStatus status;
  final double? ratingAverage;
  @JsonKey(defaultValue: 0)
  final int ratingCount;
  @JsonKey(defaultValue: false)
  final bool hasLogin;

  const StaffMemberDto({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.status = BarberStatus.pending,
    this.ratingAverage,
    this.ratingCount = 0,
    this.hasLogin = false,
  });

  bool get isActive => status == BarberStatus.enabled;

  factory StaffMemberDto.fromJson(Map<String, dynamic> json) =>
      _$StaffMemberDtoFromJson(json);
}
