// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'portfolio_photo.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PortfolioPhotoDto _$PortfolioPhotoDtoFromJson(Map<String, dynamic> json) =>
    PortfolioPhotoDto(
      id: json['id'] as String,
      url: json['url'] as String,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
    );
