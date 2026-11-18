import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  group('FeedbackReportRequestDto', () {
    test(
      'sends the source context and the related record as separate keys',
      () {
        const report = FeedbackReportRequestDto(
          kind: FeedbackKind.bug,
          message: '  The confirm button does nothing.  ',
          app: FeedbackApp.business,
          platform: 'ios',
          appVersion: '1.4.2+17',
          locale: 'ar',
          screen: 'booking/confirm',
          relatedType: FeedbackRelatedType.booking,
          relatedId: 'b-9',
        );

        expect(report.toJson(), {
          'kind': 'bug',
          'message': 'The confirm button does nothing.',
          'app': 'business',
          'platform': 'ios',
          'app_version': '1.4.2+17',
          'locale': 'ar',
          'screen': 'booking/confirm',
          'related_type': 'booking',
          'related_id': 'b-9',
        });
      },
    );

    test('omits blank optional fields and never sends a user', () {
      const report = FeedbackReportRequestDto(
        kind: FeedbackKind.suggestion,
        message: 'Add dark mode please',
        app: FeedbackApp.client,
        platform: 'android',
        contactEmail: ' ',
        appVersion: '',
      );

      final json = report.toJson();
      expect(json.keys, containsAll(['kind', 'message', 'app', 'platform']));
      expect(json.containsKey('contact_email'), isFalse);
      expect(json.containsKey('app_version'), isFalse);
      expect(json.containsKey('user_id'), isFalse);
      expect(json.containsKey('user_type'), isFalse);
    });
  });

  group('DioFeedbackRepository', () {
    test('posts the report to /feedback and treats 201 as success', () async {
      String? path;
      String? method;
      Object? body;
      final fake = fakeDio(
        handler: (options) {
          path = options.path;
          method = options.method;
          body = options.data;
          return jsonResponse(
            options,
            statusCode: 201,
            data: successEnvelope(),
          );
        },
      );

      await DioFeedbackRepository(clientWith(fake)).submit(
        const FeedbackReportRequestDto(
          kind: FeedbackKind.support,
          message: 'I cannot sign in',
          app: FeedbackApp.stylist,
          platform: 'android',
          contactEmail: 'sam@example.com',
        ),
      );

      expect(path, FeedbackEndpoints.submit);
      expect(method, 'POST');
      expect((body as Map)['contact_email'], 'sam@example.com');
    });

    test('surfaces a rate limit as an ApiException', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 429,
          data: {
            'success': false,
            'code': 'TOO_MANY_REQUESTS',
            'message': 'slow down',
          },
        ),
      );

      expect(
        DioFeedbackRepository(clientWith(fake)).submit(
          const FeedbackReportRequestDto(
            kind: FeedbackKind.bug,
            message: 'twice in a row',
            app: FeedbackApp.client,
            platform: 'ios',
            contactEmail: 'a@b.co',
          ),
        ),
        throwsA(isA<ApiException>()),
      );
    });
  });

  group('staff account deletion', () {
    test(
      'a barber deletes with the password on DELETE /barber/account',
      () async {
        String? path;
        String? method;
        Object? body;
        final fake = fakeDio(
          handler: (options) {
            path = options.path;
            method = options.method;
            body = options.data;
            return jsonResponse(options, data: successEnvelope());
          },
        );
        final repository = DioStaffAuthRepository(
          clientWith(fake),
          StaffAuthRoutes.barber(),
        );

        await repository.deleteAccount('password123');

        expect(path, '/barber/account');
        expect(method, 'DELETE');
        expect(body, {'password': 'password123'});
      },
    );

    test('a branch account cannot delete itself from the app', () {
      final repository = DioStaffAuthRepository(
        clientWith(fakeDio(handler: jsonResponse)),
        StaffAuthRoutes.branch(),
      );

      expect(() => repository.deleteAccount('x'), throwsUnsupportedError);
    });
  });

  group('LegalLinks', () {
    final links = LegalLinks.fromApiBaseUrl('https://dev-dorak-backend.io/api');

    test(
      'builds the public pages from the API host, falling back to English',
      () {
        expect(
          links.privacy('ar').toString(),
          'https://dev-dorak-backend.io/ar/privacy',
        );
        expect(
          links.terms('en').toString(),
          'https://dev-dorak-backend.io/en/terms',
        );
        expect(
          links.deleteAccount('fr').toString(),
          'https://dev-dorak-backend.io/en/delete-account',
        );
        expect(
          links.ownerRegistration.toString(),
          'https://dev-dorak-backend.io/register/business',
        );
      },
    );

    test('keeps a non-default port', () {
      final local = LegalLinks.fromApiBaseUrl('http://10.0.2.2:8000/api');

      expect(local.about('en').toString(), 'http://10.0.2.2:8000/en/about');
    });
  });
}
