// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingDto _$BookingDtoFromJson(Map<String, dynamic> json) => BookingDto(
  id: json['id'] as String,
  timeSlot: DateTime.parse(json['time_slot'] as String),
  endsAt: json['ends_at'] == null
      ? null
      : DateTime.parse(json['ends_at'] as String),
  status: $enumDecode(_$BookingStatusEnumMap, json['status']),
  paymentMethod: json['payment_method'] as String? ?? 'pay_at_salon',
  paymentStatus: json['payment_status'] as String? ?? 'unpaid_in_person',
  cancellationEligible: json['cancellation_eligible'] as bool?,
  cancellationCutoffAt: json['cancellation_cutoff_at'] == null
      ? null
      : DateTime.parse(json['cancellation_cutoff_at'] as String),
  chair: json['chair'] == null
      ? null
      : BookingChairDto.fromJson(json['chair'] as Map<String, dynamic>),
  barber: json['barber'] == null
      ? null
      : BookingBarberDto.fromJson(json['barber'] as Map<String, dynamic>),
  client: json['client'] == null
      ? null
      : BookingClientDto.fromJson(json['client'] as Map<String, dynamic>),
  services:
      (json['services'] as List<dynamic>?)
          ?.map((e) => BookingServiceDto.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  atHomeLocation: json['at_home_location'] == null
      ? null
      : AtHomeLocationDto.fromJson(
          json['at_home_location'] as Map<String, dynamic>,
        ),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$BookingDtoToJson(
  BookingDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'time_slot': instance.timeSlot.toIso8601String(),
  'ends_at': instance.endsAt?.toIso8601String(),
  'status': _$BookingStatusEnumMap[instance.status]!,
  'payment_method': instance.paymentMethod,
  'payment_status': instance.paymentStatus,
  'cancellation_eligible': instance.cancellationEligible,
  'cancellation_cutoff_at': instance.cancellationCutoffAt?.toIso8601String(),
  'chair': instance.chair,
  'barber': instance.barber,
  'client': instance.client,
  'services': instance.services,
  'at_home_location': instance.atHomeLocation,
  'created_at': instance.createdAt?.toIso8601String(),
};

const _$BookingStatusEnumMap = {
  BookingStatus.pending: 'pending',
  BookingStatus.confirmed: 'confirmed',
  BookingStatus.inProgress: 'in_progress',
  BookingStatus.canceled: 'canceled',
  BookingStatus.completed: 'completed',
  BookingStatus.noShow: 'no_show',
};
