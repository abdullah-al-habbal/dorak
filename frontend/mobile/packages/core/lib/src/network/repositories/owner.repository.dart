import 'package:dio/dio.dart';

import 'package:core/src/network/api.client.dart';
import 'package:core/src/network/dto/owner_branch.dto.dart';
import 'package:core/src/network/dto/owner_brand.dto.dart';
import 'package:core/src/network/dto/owner_payout.dto.dart';
import 'package:core/src/network/dto/owner_profile.dto.dart';
import 'package:core/src/network/dto/owner_subscription.dto.dart';
import 'package:core/src/network/endpoints/api.endpoints.dart';
import 'package:core/src/network/owner_access.entity.dart';
import 'package:core/src/network/paginated_data.dto.dart';

/// The brand owner's `/owner/*` API. The owner signs in as a client, so these calls
/// carry the client bearer token. Registration and brand creation stay on the web.
abstract class OwnerRepository {
  /// `GET /owner/me`.
  Future<OwnerProfileDto> me();

  /// Decides which experience opens after a client login: an owner, or an ordinary
  /// client who should be sent to the web registration. Never throws for "no brand".
  Future<OwnerAccess> resolveAccess();

  Future<PaginatedData<OwnerBrandDto>> getBrands({int page = 1});
  Future<OwnerBrandDto> getBrand(String id);

  /// Only the given fields change.
  Future<OwnerBrandDto> updateBrand(
    String id, {
    Map<String, String>? name,
    Map<String, String>? description,
    String? logoUrl,
    String? baseCurrencyCode,
  });

  /// Uploads a logo image and returns its public URL, to pass as `logoUrl`.
  Future<String> uploadBrandLogo(String filePath);

  /// Sends a rejected brand for another review.
  Future<OwnerBrandDto> resubmitBrand(String id);

  Future<PaginatedData<OwnerBranchDto>> getBranches({int page = 1});
  Future<OwnerBranchDto> getBranch(String id);

  Future<OwnerBranchDto> createBranch({
    required String brandId,
    required Map<String, String> name,
    required String email,
    required String password,
    Map<String, String>? description,
    Map<String, String>? address,
  });

  Future<OwnerBranchDto> updateBranch(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required String email,
    String? password,
    Map<String, String>? description,
    Map<String, String>? address,
  });

  Future<void> switchBranch(String id, {required bool on});

  Future<List<OwnerSubscriptionDto>> getSubscriptions();
  Future<PaginatedData<OwnerPayoutDto>> getPayouts({int page = 1});
}

class DioOwnerRepository implements OwnerRepository {
  const DioOwnerRepository(this._client);

  final ApiClient _client;

  @override
  Future<OwnerProfileDto> me() => _client.get(
    ApiEndpoints.owner.me,
    parser: (json) => OwnerProfileDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<OwnerAccess> resolveAccess() async {
    final profile = await me();
    return profile.isOwner && profile.brands.isNotEmpty
        ? OwnerAccessGranted(profile)
        : const OwnerAccessNoBrand();
  }

  @override
  Future<PaginatedData<OwnerBrandDto>> getBrands({int page = 1}) =>
      _client.getPaginated(
        ApiEndpoints.owner.brands,
        queryParameters: {'page': page},
        itemParser: (json) =>
            OwnerBrandDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<OwnerBrandDto> getBrand(String id) => _client.get(
    ApiEndpoints.owner.brand(id),
    parser: (json) => OwnerBrandDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<OwnerBrandDto> updateBrand(
    String id, {
    Map<String, String>? name,
    Map<String, String>? description,
    String? logoUrl,
    String? baseCurrencyCode,
  }) => _client.put(
    ApiEndpoints.owner.brand(id),
    data: {
      'name': ?name,
      'description': ?description,
      'logo_url': ?logoUrl,
      'base_currency_code': ?baseCurrencyCode,
    },
    parser: (json) => OwnerBrandDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<String> uploadBrandLogo(String filePath) async {
    final form = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    return _client.post(
      ApiEndpoints.owner.brandLogo,
      data: form,
      parser: (json) => (json as Map<String, dynamic>)['url'] as String,
    );
  }

  @override
  Future<OwnerBrandDto> resubmitBrand(String id) => _client.post(
    ApiEndpoints.owner.brandResubmit(id),
    parser: (json) => OwnerBrandDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<PaginatedData<OwnerBranchDto>> getBranches({int page = 1}) =>
      _client.getPaginated(
        ApiEndpoints.owner.branches,
        queryParameters: {'page': page},
        itemParser: (json) =>
            OwnerBranchDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<OwnerBranchDto> getBranch(String id) => _client.get(
    ApiEndpoints.owner.branch(id),
    parser: (json) => OwnerBranchDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<OwnerBranchDto> createBranch({
    required String brandId,
    required Map<String, String> name,
    required String email,
    required String password,
    Map<String, String>? description,
    Map<String, String>? address,
  }) => _client.post(
    ApiEndpoints.owner.branches,
    data: {
      'brand_id': brandId,
      'name': name,
      'email': email,
      'password': password,
      'description': ?description,
      'address': ?address,
    },
    parser: (json) => OwnerBranchDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<OwnerBranchDto> updateBranch(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required String email,
    String? password,
    Map<String, String>? description,
    Map<String, String>? address,
  }) => _client.put(
    ApiEndpoints.owner.branch(id),
    data: {
      'brand_id': brandId,
      'name': name,
      'email': email,
      'password': ?password,
      'description': ?description,
      'address': ?address,
    },
    parser: (json) => OwnerBranchDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<void> switchBranch(String id, {required bool on}) => _client
      .patch<void>(ApiEndpoints.owner.branchSwitch(id, on: on), parser: (_) {});

  @override
  Future<List<OwnerSubscriptionDto>> getSubscriptions() => _client.get(
    ApiEndpoints.owner.subscription,
    parser: (json) => [
      for (final item in json as List<dynamic>)
        OwnerSubscriptionDto.fromJson(item as Map<String, dynamic>),
    ],
  );

  @override
  Future<PaginatedData<OwnerPayoutDto>> getPayouts({int page = 1}) =>
      _client.getPaginated(
        ApiEndpoints.owner.payouts,
        queryParameters: {'page': page},
        itemParser: (json) =>
            OwnerPayoutDto.fromJson(json as Map<String, dynamic>),
      );
}
