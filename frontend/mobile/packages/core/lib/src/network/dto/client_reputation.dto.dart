import 'package:json_annotation/json_annotation.dart';

part 'client_reputation.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ClientReputationDto {
  final double? average;
  @JsonKey(defaultValue: 0)
  final int count;

  const ClientReputationDto({this.average, this.count = 0});

  bool get isRated => count > 0 && average != null;

  factory ClientReputationDto.fromJson(Map<String, dynamic> json) =>
      _$ClientReputationDtoFromJson(json);
}
