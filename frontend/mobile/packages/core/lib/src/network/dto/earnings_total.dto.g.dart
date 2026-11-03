// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'earnings_total.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EarningsTotalDto _$EarningsTotalDtoFromJson(Map<String, dynamic> json) =>
    EarningsTotalDto(
      currencyCode: json['currency_code'] as String,
      grossMinor: (json['gross_minor'] as num?)?.toInt() ?? 0,
      commissionMinor: (json['commission_minor'] as num?)?.toInt(),
      netMinor: (json['net_minor'] as num?)?.toInt(),
      completedBookingsCount:
          (json['completed_bookings_count'] as num?)?.toInt() ?? 0,
    );
