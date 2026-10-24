// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_service.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingServiceDto _$BookingServiceDtoFromJson(Map<String, dynamic> json) =>
    BookingServiceDto(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num?)?.toDouble(),
      duration: (json['duration'] as num?)?.toInt(),
      owner: json['owner'] as String?,
    );

Map<String, dynamic> _$BookingServiceDtoToJson(BookingServiceDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'price': instance.price,
      'duration': instance.duration,
      'owner': instance.owner,
    };
