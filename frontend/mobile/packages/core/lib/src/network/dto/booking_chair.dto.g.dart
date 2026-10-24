// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_chair.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingChairDto _$BookingChairDtoFromJson(Map<String, dynamic> json) =>
    BookingChairDto(
      id: json['id'] as String,
      label: json['label'] as String?,
      status: json['status'] as String?,
    );

Map<String, dynamic> _$BookingChairDtoToJson(BookingChairDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'label': instance.label,
      'status': instance.status,
    };
