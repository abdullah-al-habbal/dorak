import 'package:dio/dio.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _brand = {
  'id': 'brand-1',
  'name': {'en': 'Fade Lab', 'ar': 'فيد لاب'},
  'description': {'en': null, 'ar': null},
  'logo_url': null,
  'slug': 'fade-lab',
  'universe': 'men',
  'status': 'rejected',
  'status_reason': 'Logo is unclear',
  'submission_count': 1,
  'max_submissions': 3,
  'branches_count': 2,
  'features': {'multi_branch': true},
};

OwnerRepository _repository(
  Response<dynamic> Function(RequestOptions) handler, {
  void Function(RequestOptions)? onRequest,
}) {
  final fake = fakeDio(
    handler: (options) {
      onRequest?.call(options);
      return handler(options);
    },
  );
  return DioOwnerRepository(clientWith(fake));
}

void main() {
  group('role resolution', () {
    test('a client with brands is an owner', () async {
      String? path;
      final repository = _repository(
        (options) => jsonResponse(
          options,
          data: successEnvelope(
            data: {
              'is_owner': true,
              'brand_ids': ['brand-1'],
              'branch_count': 1,
              'brands': [
                {
                  'id': 'brand-1',
                  'name': {'en': 'Fade Lab', 'ar': 'فيد لاب'},
                  'status': 'pending',
                },
              ],
            },
          ),
        ),
        onRequest: (o) => path = o.path,
      );

      final access = await repository.resolveAccess();

      expect(path, '/owner/me');
      expect(access, isA<OwnerAccessGranted>());
      final profile = (access as OwnerAccessGranted).profile;
      expect(profile.brands.single.status, OwnerBrandStatus.pending);
      expect(
        LocalizedName.resolve(profile.brands.single.name, 'ar'),
        'فيد لاب',
      );
    });

    test(
      'a client with no brand is told to use the web registration, not an error',
      () async {
        final repository = _repository(
          (options) => jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'is_owner': false,
                'brand_ids': [],
                'branch_count': 0,
                'brands': [],
              },
            ),
          ),
        );

        expect(await repository.resolveAccess(), isA<OwnerAccessNoBrand>());
      },
    );

    test(
      'an unknown brand status becomes unknown instead of failing',
      () async {
        final repository = _repository(
          (options) => jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'is_owner': true,
                'brands': [
                  {'id': 'b', 'name': 'Plain', 'status': 'archived'},
                ],
              },
            ),
          ),
        );

        final profile = await repository.me();

        expect(profile.brands.single.status, OwnerBrandStatus.unknown);
        expect(profile.brands.single.name['en'], 'Plain');
      },
    );

    test('a 401 and a 403 reach the caller as ApiException', () async {
      for (final status in [401, 403]) {
        final repository = _repository(
          (options) => jsonResponse(
            options,
            statusCode: status,
            data: {'success': false, 'code': 'X', 'message': 'no'},
          ),
        );

        expect(repository.me(), throwsA(isA<ApiException>()));
      }
    });
  });

  group('brands', () {
    test('parses a rejected brand and when it can be resubmitted', () async {
      final repository = _repository(
        (options) => jsonResponse(options, data: successEnvelope(data: _brand)),
      );

      final brand = await repository.getBrand('brand-1');

      expect(brand.status, OwnerBrandStatus.rejected);
      expect(brand.statusReason, 'Logo is unclear');
      expect(brand.canResubmit, isTrue);
      expect(brand.features['multi_branch'], isTrue);
      expect(brand.branchesCount, 2);
    });

    test('updates only the fields given and resubmits with POST', () async {
      final calls = <String>[];
      Object? body;
      final repository = _repository(
        (options) => jsonResponse(options, data: successEnvelope(data: _brand)),
        onRequest: (o) {
          calls.add('${o.method} ${o.path}');
          body = o.data;
        },
      );

      await repository.updateBrand(
        'brand-1',
        name: {'en': 'New', 'ar': 'جديد'},
      );
      expect(body, {
        'name': {'en': 'New', 'ar': 'جديد'},
      });
      await repository.resubmitBrand('brand-1');

      expect(calls, [
        'PUT /owner/brands/brand-1',
        'POST /owner/brands/brand-1/resubmit',
      ]);
    });

    test('a 422 from an update is a ValidationException', () async {
      final repository = _repository(
        (options) => jsonResponse(
          options,
          statusCode: 422,
          data: {
            'success': false,
            'code': 'UNPROCESSABLE_ENTITY',
            'message': 'invalid',
            'errors': {
              'name.en': ['too long'],
            },
          },
        ),
      );

      expect(
        repository.updateBrand('brand-1', name: {'en': 'x'}),
        throwsA(isA<ApiException>()),
      );
    });
  });

  group('branches', () {
    test(
      'lists branches with string or map names and decimal coordinates',
      () async {
        final repository = _repository(
          (options) => jsonResponse(
            options,
            data: successEnvelope(
              data: [
                {
                  'id': 'br-1',
                  'name': 'Downtown',
                  'email': 'dt@example.test',
                  'status': 'enabled',
                  'brand_id': 'brand-1',
                  'latitude': '33.50000000',
                  'longitude': 36.3,
                },
                {
                  'id': 'br-2',
                  'name': {'en': 'Old Town', 'ar': 'البلدة'},
                  'status': 'suspended',
                  'brand_id': 'brand-1',
                },
              ],
              meta: {
                'total': 2,
                'count': 2,
                'per_page': 20,
                'current_page': 1,
                'total_pages': 1,
              },
            ),
          ),
        );

        final page = await repository.getBranches();

        expect(page.data.first.isEnabled, isTrue);
        expect(page.data.first.latitude, 33.5);
        expect(page.data.first.longitude, 36.3);
        expect(LocalizedName.resolve(page.data.last.name, 'ar'), 'البلدة');
        expect(page.data.last.status, OwnerBranchStatus.suspended);
      },
    );

    test(
      'create sends the brand, names and password; switch uses the right verb and path',
      () async {
        final calls = <String>[];
        Object? body;
        final repository = _repository(
          (options) => jsonResponse(
            options,
            data: successEnvelope(
              data: {'id': 'br-9', 'name': 'x', 'brand_id': 'brand-1'},
            ),
          ),
          onRequest: (o) {
            calls.add('${o.method} ${o.path}');
            if (o.method == 'POST') body = o.data;
          },
        );

        await repository.createBranch(
          brandId: 'brand-1',
          name: {'en': 'B2', 'ar': 'ب٢'},
          email: 'b2@example.test',
          password: 'a-branch-password-1',
        );
        await repository.switchBranch('br-9', on: false);
        await repository.switchBranch('br-9', on: true);

        expect((body as Map)['brand_id'], 'brand-1');
        expect((body as Map)['password'], 'a-branch-password-1');
        expect(calls, [
          'POST /owner/branches',
          'PATCH /owner/branches/br-9/switch-off',
          'PATCH /owner/branches/br-9/switch-on',
        ]);
      },
    );

    test(
      'a pending brand creating a second branch is a 403 ApiException',
      () async {
        final repository = _repository(
          (options) => jsonResponse(
            options,
            statusCode: 403,
            data: {
              'success': false,
              'code': 'brand_not_approved',
              'message': 'wait',
            },
          ),
        );

        await expectLater(
          repository.createBranch(
            brandId: 'b',
            name: {'en': 'x', 'ar': 'x'},
            email: 'x@y.co',
            password: 'a-branch-password-1',
          ),
          throwsA(
            isA<ApiException>().having(
              (e) => e.code,
              'code',
              'brand_not_approved',
            ),
          ),
        );
      },
    );
  });

  group('billing', () {
    test(
      'reads the plan with the brand nested and payouts as a page',
      () async {
        var call = 0;
        final repository = _repository((options) {
          call++;
          return jsonResponse(
            options,
            data: call == 1
                ? successEnvelope(
                    data: [
                      {
                        'id': 's-1',
                        'status': 'active',
                        'brand': {
                          'id': 'brand-1',
                          'name': {'en': 'Fade Lab', 'ar': 'فيد لاب'},
                        },
                        'plan': {
                          'id': 'p-1',
                          'name': {'en': 'Pro', 'ar': 'برو'},
                          'price_amount_minor': 2500,
                          'currency_code': 'USD',
                          'interval_unit': 'month',
                          'interval_count': 1,
                          'feature_keys': ['multi_branch'],
                        },
                        'starts_at': '2026-11-01T00:00:00+00:00',
                        'ends_at': null,
                      },
                    ],
                  )
                : successEnvelope(
                    data: [
                      {
                        'id': 'po-1',
                        'status': 'paid',
                        'direction_type': 'platform_to_brand',
                        'total_amount_minor': 12000,
                        'currency_code': 'USD',
                        'period_started_at': '2026-10-01T00:00:00+00:00',
                        'paid_at': '2026-11-02T10:00:00+00:00',
                        'external_reference': 'REF-1',
                      },
                    ],
                    meta: {
                      'total': 1,
                      'count': 1,
                      'per_page': 20,
                      'current_page': 1,
                      'total_pages': 1,
                    },
                  ),
          );
        });

        final subscriptions = await repository.getSubscriptions();
        final payouts = await repository.getPayouts();

        expect(subscriptions.single.plan.priceAmountMinor, 2500);
        expect(subscriptions.single.brandId, 'brand-1');
        expect(
          LocalizedName.resolve(subscriptions.single.brandName, 'ar'),
          'فيد لاب',
        );
        expect(payouts.data.single.totalAmountMinor, 12000);
        expect(payouts.data.single.paidAt, isNotNull);
      },
    );
  });

  group('owner services reuse the branch service repository', () {
    test('lists and deletes on the owner path', () async {
      final calls = <String>[];
      final fake = fakeDio(
        handler: (options) {
          calls.add('${options.method} ${options.path}');
          return jsonResponse(options, data: successEnvelope(data: <Object>[]));
        },
      );
      final repository = DioBranchServiceRepository(
        clientWith(fake),
        ApiEndpoints.owner.services,
      );

      await repository.getServices();
      await repository.deleteService('svc-1');

      expect(calls, ['GET /owner/services', 'DELETE /owner/services/svc-1']);
    });
  });
}
