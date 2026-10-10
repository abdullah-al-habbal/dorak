import 'package:json_annotation/json_annotation.dart';

part 'client_favorite.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ClientFavoriteDto {
  const ClientFavoriteDto({
    required this.id,
    required this.favorableId,
    required this.favorableType,
    this.favorable,
    this.createdAt,
  });

  final String id;
  final String favorableId;
  final String favorableType;
  final Map<String, dynamic>? favorable;
  final DateTime? createdAt;

  factory ClientFavoriteDto.fromJson(Map<String, dynamic> json) =>
      _$ClientFavoriteDtoFromJson(json);
}
