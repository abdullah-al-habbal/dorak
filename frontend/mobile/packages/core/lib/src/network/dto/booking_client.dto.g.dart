// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_client.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingClientDto _$BookingClientDtoFromJson(Map<String, dynamic> json) =>
    BookingClientDto(
      id: json['id'] as String,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      reputation: json['reputation'] == null
          ? const ClientReputationDto()
          : ClientReputationDto.fromJson(
              json['reputation'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$BookingClientDtoToJson(BookingClientDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'phone': instance.phone,
      'reputation': instance.reputation,
    };
