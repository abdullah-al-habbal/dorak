import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> _branch(Object? status) => {
  'id': 'b1',
  'name': {'en': 'Downtown', 'ar': 'وسط المدينة'},
  'brand_id': 'brand-1',
  'status': status,
};

Map<String, dynamic> _affiliation(Object? status) => {
  'id': 'a1',
  'barber_id': 'barber-1',
  'affiliable_id': 'brand-1',
  'affiliable_type': 'brand',
  'status': status,
};

void main() {
  group('OwnerBranchDto status', () {
    test('reads every status the backend sends', () {
      for (final status in OwnerBranchStatus.values.where(
        (value) => value != OwnerBranchStatus.unknown,
      )) {
        expect(OwnerBranchDto.fromJson(_branch(status.wire)).status, status);
      }
    });

    test('an unknown, missing or non-string status reads as unknown', () {
      for (final value in <Object?>['archived', '', null, 7]) {
        final branch = OwnerBranchDto.fromJson(_branch(value));
        expect(branch.status, OwnerBranchStatus.unknown);
        expect(branch.isEnabled, isFalse);
      }
    });

    test('only enabled counts as enabled', () {
      expect(OwnerBranchDto.fromJson(_branch('enabled')).isEnabled, isTrue);
      expect(OwnerBranchDto.fromJson(_branch('suspended')).isEnabled, isFalse);
    });
  });

  group('BarberAffiliationDto status', () {
    test('reads every status the backend sends', () {
      for (final status in BarberAffiliationStatus.values.where(
        (value) => value != BarberAffiliationStatus.unknown,
      )) {
        expect(
          BarberAffiliationDto.fromJson(_affiliation(status.wire)).status,
          status,
        );
      }
    });

    test('an unknown, missing or non-string status reads as unknown', () {
      for (final value in <Object?>['paused', '', null, 7]) {
        final affiliation = BarberAffiliationDto.fromJson(_affiliation(value));
        expect(affiliation.status, BarberAffiliationStatus.unknown);
        expect(affiliation.isPending, isFalse);
        expect(affiliation.isActive, isFalse);
      }
    });
  });

  group('JobApplicationDto status', () {
    Map<String, dynamic> application(Object? status) => {
      'id': 'j1',
      'job_posting_id': 'job-1',
      'barber_id': 'barber-1',
      'status': status,
    };

    test('reads every status the backend sends', () {
      for (final status in JobApplicationStatus.values.where(
        (value) => value != JobApplicationStatus.unknown,
      )) {
        expect(
          JobApplicationDto.fromJson(application(status.wire)).status,
          status,
        );
      }
    });

    test('an unknown, missing or non-string status reads as unknown', () {
      for (final value in <Object?>['withdrawn', '', null, 7]) {
        final dto = JobApplicationDto.fromJson(application(value));
        expect(dto.status, JobApplicationStatus.unknown);
        expect(dto.status.isDecided, isFalse);
      }
    });

    test('only accepted and rejected are decided', () {
      expect(JobApplicationStatus.accepted.isDecided, isTrue);
      expect(JobApplicationStatus.rejected.isDecided, isTrue);
      expect(JobApplicationStatus.seen.isDecided, isFalse);
    });
  });
}
