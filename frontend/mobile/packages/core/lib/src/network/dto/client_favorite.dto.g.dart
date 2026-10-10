// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'client_favorite.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClientFavoriteDto _$ClientFavoriteDtoFromJson(Map<String, dynamic> json) =>
    ClientFavoriteDto(
      id: json['id'] as String,
      favorableId: json['favorable_id'] as String,
      favorableType: json['favorable_type'] as String,
      favorable: json['favorable'] as Map<String, dynamic>?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );
