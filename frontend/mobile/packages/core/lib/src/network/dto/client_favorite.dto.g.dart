// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'client_favorite.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClientFavoriteDto _$ClientFavoriteDtoFromJson(Map<String, dynamic> json) =>
    ClientFavoriteDto(
      id: json['id'] as String,
      favoritedId: json['favorited_id'] as String,
      favoritedType: json['favorited_type'] as String,
      favorited: json['favorited'] as Map<String, dynamic>?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );
