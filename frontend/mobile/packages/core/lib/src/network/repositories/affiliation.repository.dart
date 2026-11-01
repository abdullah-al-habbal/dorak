import 'package:core/core.dart';

abstract class AffiliationRepository {
  Future<BarberAffiliationDto> createAffiliation(
    String barberId, {
    required String affiliableId,
    required String affiliableType,
    double? commissionRate,
  });
  Future<List<BarberAffiliationDto>> getBarberAffiliations(String barberId);
  Future<BarberAffiliationDto> acceptAffiliation(String affiliationId);
  Future<BarberAffiliationDto> rejectAffiliation(String affiliationId);
  Future<BarberAffiliationDto> terminateAffiliation(String affiliationId);
  Future<BarberAffiliationDto> inviteBarber(
    String barberId, {
    double? commissionRate,
  });
  Future<List<BarberAffiliationDto>> getBranchAffiliations();
  Future<BarberAffiliationDto> acceptBranchAffiliation(String affiliationId);
  Future<BarberAffiliationDto> rejectBranchAffiliation(String affiliationId);
  Future<BarberAffiliationDto> terminateBranchAffiliation(String affiliationId);
}

class DioAffiliationRepository implements AffiliationRepository {
  const DioAffiliationRepository(this._client);
  final ApiClient _client;

  @override
  Future<BarberAffiliationDto> createAffiliation(
    String barberId, {
    required String affiliableId,
    required String affiliableType,
    double? commissionRate,
  }) => _client.post(
    ApiEndpoints.affiliation.barberAffiliate(barberId),
    data: {
      'affiliable_id': affiliableId,
      'affiliable_type': affiliableType,
      'commission_rate': ?commissionRate,
    },
    parser: (json) =>
        BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<List<BarberAffiliationDto>> getBarberAffiliations(String barberId) =>
      _client.get(
        ApiEndpoints.affiliation.barberAffiliations(barberId),
        parser: (json) => (json as List<dynamic>)
            .map(
              (item) =>
                  BarberAffiliationDto.fromJson(item as Map<String, dynamic>),
            )
            .toList(),
      );

  @override
  Future<BarberAffiliationDto> acceptAffiliation(String affiliationId) =>
      _client.post(
        ApiEndpoints.affiliation.affiliationAccept(affiliationId),
        parser: (json) =>
            BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<BarberAffiliationDto> rejectAffiliation(String affiliationId) =>
      _client.post(
        ApiEndpoints.affiliation.affiliationReject(affiliationId),
        parser: (json) =>
            BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<BarberAffiliationDto> terminateAffiliation(String affiliationId) =>
      _client.post(
        ApiEndpoints.affiliation.affiliationTerminate(affiliationId),
        parser: (json) =>
            BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<BarberAffiliationDto> inviteBarber(
    String barberId, {
    double? commissionRate,
  }) => _client.post(
    ApiEndpoints.affiliation.branchAffiliations,
    data: {'barber_id': barberId, 'commission_rate': ?commissionRate},
    parser: (json) =>
        BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<List<BarberAffiliationDto>> getBranchAffiliations() => _client.get(
    ApiEndpoints.affiliation.branchAffiliations,
    parser: (json) => (json as List<dynamic>)
        .map(
          (item) => BarberAffiliationDto.fromJson(item as Map<String, dynamic>),
        )
        .toList(),
  );

  @override
  Future<BarberAffiliationDto> acceptBranchAffiliation(String affiliationId) =>
      _client.post(
        ApiEndpoints.affiliation.branchAffiliationAccept(affiliationId),
        parser: (json) =>
            BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<BarberAffiliationDto> rejectBranchAffiliation(String affiliationId) =>
      _client.post(
        ApiEndpoints.affiliation.branchAffiliationReject(affiliationId),
        parser: (json) =>
            BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<BarberAffiliationDto> terminateBranchAffiliation(
    String affiliationId,
  ) => _client.post(
    ApiEndpoints.affiliation.branchAffiliationTerminate(affiliationId),
    parser: (json) =>
        BarberAffiliationDto.fromJson(json as Map<String, dynamic>),
  );
}
