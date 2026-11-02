import 'package:json_annotation/json_annotation.dart';

part 'client_favorite.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ClientFavoriteDto {
  const ClientFavoriteDto({
    required this.id,
    required this.favoritedId,
    required this.favoritedType,
    this.favorited,
    this.createdAt,
  });

  final String id;
  final String favoritedId;
  final String favoritedType;
  final Map<String, dynamic>? favorited;
  final DateTime? createdAt;

  factory ClientFavoriteDto.fromJson(Map<String, dynamic> json) =>
      _$ClientFavoriteDtoFromJson(json);
}
