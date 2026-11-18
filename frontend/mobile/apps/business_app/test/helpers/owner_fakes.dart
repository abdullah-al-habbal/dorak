import 'package:core/core.dart';

import 'package:business_app/src/core/owner_feature_blocs.provider.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/app_role.provider.dart';
import 'package:business_app/src/features/owner/owner_billing.bloc.dart';
import 'package:business_app/src/features/owner/owner_branches.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_services.bloc.dart';
import 'package:business_app/src/features/owner/role_auth.repository.dart';

const _page = PaginationMeta(
  total: 1,
  count: 1,
  perPage: 15,
  currentPage: 1,
  totalPages: 1,
);

OwnerBrandDto brandFixture({
  OwnerBrandStatus status = OwnerBrandStatus.active,
  String? reason,
  int submissions = 1,
  int maxSubmissions = 3,
}) => OwnerBrandDto(
  id: 'brand-1',
  name: const {'en': 'Fade Co', 'ar': 'فيد'},
  status: status,
  statusReason: reason,
  submissionCount: submissions,
  maxSubmissions: maxSubmissions,
);

OwnerBranchDto branchFixture({
  String id = 'branch-1',
  String status = 'enabled',
}) => OwnerBranchDto(
  id: id,
  name: const {'en': 'Downtown', 'ar': 'وسط المدينة'},
  brandId: 'brand-1',
  email: 'downtown@example.com',
  status: status,
);

class FakeOwnerRepository implements OwnerRepository {
  FakeOwnerRepository({
    this.brand,
    List<OwnerBranchDto>? branches,
    this.error,
    this.subscriptions = const [],
    this.payouts = const [],
  }) : branches = branches ?? [];

  OwnerBrandDto? brand;
  final List<OwnerBranchDto> branches;
  Object? error;
  List<OwnerSubscriptionDto> subscriptions;
  List<OwnerPayoutDto> payouts;
  final calls = <String>[];

  void _maybeThrow() {
    final failure = error;
    if (failure != null) throw failure;
  }

  @override
  Future<OwnerAccess> resolveAccess() async {
    _maybeThrow();
    final current = brand;
    if (current == null) return const OwnerAccessNoBrand();
    return OwnerAccessGranted(
      OwnerProfileDto(
        isOwner: true,
        brandIds: [current.id],
        brands: [
          OwnerBrandSummaryDto(
            id: current.id,
            name: current.name,
            status: current.status,
          ),
        ],
      ),
    );
  }

  @override
  Future<PaginatedData<OwnerBrandDto>> getBrands({int page = 1}) async =>
      PaginatedData(data: [?brand], meta: _page);

  @override
  Future<OwnerBrandDto> resubmitBrand(String id) async {
    calls.add('resubmit:$id');
    _maybeThrow();
    return brand = brandFixture(status: OwnerBrandStatus.pending);
  }

  @override
  Future<PaginatedData<OwnerBranchDto>> getBranches({int page = 1}) async {
    _maybeThrow();
    return PaginatedData(data: List.of(branches), meta: _page);
  }

  @override
  Future<void> switchBranch(String id, {required bool on}) async {
    calls.add('switch:$id:$on');
    _maybeThrow();
    final index = branches.indexWhere((branch) => branch.id == id);
    branches[index] = branchFixture(
      id: id,
      status: on ? 'enabled' : 'disabled',
    );
  }

  @override
  Future<OwnerBranchDto> createBranch({
    required String brandId,
    required Map<String, String> name,
    required String email,
    required String password,
    Map<String, String>? description,
    Map<String, String>? address,
  }) async {
    calls.add('create:${name['en']}:$email:$password');
    _maybeThrow();
    return branchFixture(id: 'new');
  }

  @override
  Future<OwnerBranchDto> updateBranch(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required String email,
    String? password,
    Map<String, String>? description,
    Map<String, String>? address,
  }) async {
    calls.add('update:$id:${name['en']}:$email:${password ?? '-'}');
    _maybeThrow();
    return branchFixture(id: id);
  }

  @override
  Future<List<OwnerSubscriptionDto>> getSubscriptions() async => subscriptions;

  @override
  Future<PaginatedData<OwnerPayoutDto>> getPayouts({int page = 1}) async =>
      PaginatedData(data: payouts, meta: _page);

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class FakeBranchServiceRepository2 implements BranchServiceRepository {
  final saved = <String>[];

  @override
  Future<PaginatedData<BusinessServiceDto>> getServices({
    int page = 1,
    int perPage = 20,
  }) async => const PaginatedData(data: [], meta: _page);

  @override
  Future<BusinessServiceDto> createService({
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  }) async {
    saved.add('create:${name['en']}:$price:$currencyCode:$durationMinutes');
    return BusinessServiceDto(
      id: 's',
      serviceableId: brandId,
      name: name['en']!,
    );
  }

  @override
  Future<BusinessServiceDto> updateService(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  }) async {
    saved.add('update:$id');
    return BusinessServiceDto(
      id: id,
      serviceableId: brandId,
      name: name['en']!,
    );
  }

  @override
  Future<void> deleteService(String id) async => saved.add('delete:$id');
}

class InMemoryRoleProvider implements AppRoleProvider {
  AppRole? stored;

  @override
  Future<AppRole?> read() async => stored;

  @override
  Future<void> write(AppRole role) async => stored = role;

  @override
  Future<void> clear() async => stored = null;
}

class RecordingStaffAuth implements StaffAuthRepository {
  RecordingStaffAuth(this.name);

  final String name;
  final calls = <String>[];

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async {
    calls.add('login');
    return '$name-token';
  }

  @override
  Future<void> logout() async => calls.add('logout');

  @override
  Future<String> refreshToken() async => '$name-token';

  @override
  Future<void> forgotPassword(String email) async => calls.add('forgot');

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async => calls.add('reset');
}

RoleAuthRepository roleAuthFor({
  RecordingStaffAuth? branch,
  RecordingStaffAuth? owner,
  InMemoryRoleProvider? roles,
}) => RoleAuthRepository(
  branch: branch ?? RecordingStaffAuth('branch'),
  owner: owner ?? RecordingStaffAuth('owner'),
  roles: roles ?? InMemoryRoleProvider(),
);

OwnerFeatureBlocs ownerBlocsFor(
  FakeOwnerRepository owner, {
  FakeBranchServiceRepository2? services,
}) => OwnerFeatureBlocs(
  home: OwnerHomeCubit(owner),
  branches: OwnerBranchesCubit(owner),
  billing: OwnerBillingCubit(owner),
  services: OwnerServicesCubit(services ?? FakeBranchServiceRepository2()),
);

class _FailingStaffAuth extends RecordingStaffAuth {
  _FailingStaffAuth() : super('owner');

  @override
  Future<String> login({required String email, required String password}) =>
      throw StateError('rejected');
}

/// A role repository whose owner login always fails.
class RoleAuthRepositoryFailing {
  const RoleAuthRepositoryFailing._();

  static RoleAuthRepository build(InMemoryRoleProvider roles) =>
      RoleAuthRepository(
        branch: RecordingStaffAuth('branch'),
        owner: _FailingStaffAuth(),
        roles: roles,
      );
}
