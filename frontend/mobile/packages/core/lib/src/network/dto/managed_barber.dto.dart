import 'package:json_annotation/json_annotation.dart';

part 'managed_barber.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ManagedBarberDto {
  final String id;
  final Map<String, dynamic> name;
  final String? phone;
  final bool? hasLogin;

  const ManagedBarberDto({
    required this.id,
    required this.name,
    this.phone,
    this.hasLogin,
  });

  factory ManagedBarberDto.fromJson(Map<String, dynamic> json) =>
      _$ManagedBarberDtoFromJson(json);
}
