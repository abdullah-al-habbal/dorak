import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/owner_branches.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.state.dart';

import 'helpers/owner_fakes.dart';

void main() {
  group('role routing', () {
    test('an owner login uses the client API and remembers the role', () async {
      final branch = RecordingStaffAuth('branch');
      final owner = RecordingStaffAuth('owner');
      final roles = InMemoryRoleProvider();
      final auth = roleAuthFor(branch: branch, owner: owner, roles: roles)
        ..role = AppRole.owner;

      final token = await auth.login(email: 'a@b.co', password: 'secret-pass');

      expect(token, 'owner-token');
      expect(owner.calls, ['login']);
      expect(branch.calls, isEmpty);
      expect(roles.stored, AppRole.owner);
    });

    test('a branch login keeps the branch API and role', () async {
      final branch = RecordingStaffAuth('branch');
      final roles = InMemoryRoleProvider();
      final auth = roleAuthFor(branch: branch, roles: roles);

      await auth.login(email: 'a@b.co', password: 'secret-pass');
      await auth.forgotPassword('a@b.co');

      expect(branch.calls, ['login', 'forgot']);
      expect(roles.stored, AppRole.branch);
    });

    test('logout revokes the right session and forgets the role', () async {
      final owner = RecordingStaffAuth('owner');
      final roles = InMemoryRoleProvider()..stored = AppRole.owner;
      final auth = roleAuthFor(owner: owner, roles: roles);
      await auth.restoreRole();

      await auth.logout();

      expect(auth.role, AppRole.owner);
      expect(owner.calls, ['logout']);
      expect(roles.stored, isNull);
    });

    test('with nothing stored the app starts as a branch account', () async {
      final auth = roleAuthFor();
      await auth.restoreRole();
      expect(auth.role, AppRole.branch);
    });

    test('a failed login never saves the role', () async {
      final roles = InMemoryRoleProvider();
      final auth = RoleAuthRepositoryFailing.build(roles)..role = AppRole.owner;

      await expectLater(
        auth.login(email: 'a@b.co', password: 'bad'),
        throwsA(isA<StateError>()),
      );
      expect(roles.stored, isNull);
    });
  });

  group('OwnerHomeCubit', () {
    test('an owner with a pending brand gets that brand', () async {
      final cubit = OwnerHomeCubit(
        FakeOwnerRepository(
          brand: brandFixture(status: OwnerBrandStatus.pending),
        ),
      );
      await cubit.load();
      expect(cubit.state.status, OwnerHomeStatus.ready);
      expect(cubit.state.brandStatus, OwnerBrandStatus.pending);
      await cubit.close();
    });

    test('a client without a brand is sent to the web registration', () async {
      final cubit = OwnerHomeCubit(FakeOwnerRepository());
      await cubit.load();
      expect(cubit.state.status, OwnerHomeStatus.noBrand);
      await cubit.close();
    });

    test('a failure is kept for the screen', () async {
      final cubit = OwnerHomeCubit(
        FakeOwnerRepository(error: Exception('boom')),
      );
      await cubit.load();
      expect(cubit.state.status, OwnerHomeStatus.failed);
      await cubit.close();
    });

    test('a rejected brand with attempts left can be resubmitted', () async {
      final repository = FakeOwnerRepository(
        brand: brandFixture(
          status: OwnerBrandStatus.rejected,
          reason: 'Blurry logo',
        ),
      );
      final cubit = OwnerHomeCubit(repository);
      await cubit.load();

      await cubit.resubmit();

      expect(repository.calls, ['resubmit:brand-1']);
      expect(cubit.state.brandStatus, OwnerBrandStatus.pending);
      expect(cubit.state.resubmitted, isTrue);
      await cubit.close();
    });

    test('a rejected brand at the limit cannot be resubmitted', () async {
      final repository = FakeOwnerRepository(
        brand: brandFixture(status: OwnerBrandStatus.rejected, submissions: 3),
      );
      final cubit = OwnerHomeCubit(repository);
      await cubit.load();

      await cubit.resubmit();

      expect(repository.calls, isEmpty);
      await cubit.close();
    });
  });

  group('OwnerBranchesCubit', () {
    test('switching a branch calls the API and shows the new status', () async {
      final repository = FakeOwnerRepository(branches: [branchFixture()]);
      final cubit = OwnerBranchesCubit(repository);
      await cubit.load();

      await cubit.switchBranch('branch-1', on: false);

      expect(repository.calls, ['switch:branch-1:false']);
      expect(cubit.state.branches.single.isEnabled, isFalse);
      await cubit.close();
    });

    test(
      'creating a branch sends both names, the email and the password',
      () async {
        final repository = FakeOwnerRepository();
        final cubit = OwnerBranchesCubit(repository);

        await cubit.save(
          brandId: 'brand-1',
          nameEn: 'Uptown',
          nameAr: 'أبتاون',
          email: 'uptown@example.com',
          password: 'secret-pass',
        );

        expect(repository.calls, [
          'create:Uptown:uptown@example.com:secret-pass',
        ]);
        expect(cubit.state.saved, isTrue);
        await cubit.close();
      },
    );

    test('editing with a blank password keeps the current one', () async {
      final repository = FakeOwnerRepository(branches: [branchFixture()]);
      final cubit = OwnerBranchesCubit(repository);

      await cubit.save(
        id: 'branch-1',
        brandId: 'brand-1',
        nameEn: 'Downtown 2',
        nameAr: 'وسط',
        email: 'downtown@example.com',
        password: '',
      );

      expect(repository.calls, [
        'update:branch-1:Downtown 2:downtown@example.com:-',
      ]);
      await cubit.close();
    });

    test('a refused save keeps the error and stays unsaved', () async {
      final repository = FakeOwnerRepository()..error = Exception('limit');
      final cubit = OwnerBranchesCubit(repository);

      await cubit.save(
        brandId: 'brand-1',
        nameEn: 'A',
        nameAr: 'ب',
        email: 'a@b.co',
        password: 'secret-pass',
      );

      expect(cubit.state.saved, isFalse);
      expect(cubit.state.error, isNotNull);
      await cubit.close();
    });
  });
}
