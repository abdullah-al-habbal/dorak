import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, Object?> chairJson({
  String status = 'available',
  String? availability,
}) => {
  'id': 'chair-1',
  'label': 'A',
  'status': status,
  'availability': ?availability,
};

void main() {
  group('ChairStatus', () {
    test('fromValue falls back to unknown instead of throwing', () {
      expect(ChairStatus.fromValue('broken'), ChairStatus.unknown);
    });

    test('FloorChairDto keeps decoding an unrecognised status', () {
      final chair = FloorChairDto.fromJson(chairJson(status: 'broken'));
      expect(chair.status, ChairStatus.unknown);
    });

    test(
      'an unrecognised availability reads as absent, not as a known state',
      () {
        final chair = FloorChairDto.fromJson(chairJson(availability: 'broken'));
        expect(chair.availability, isNull);
        expect(chair.status, ChairStatus.available);
      },
    );

    test('known values still decode', () {
      final chair = FloorChairDto.fromJson(
        chairJson(status: 'maintenance', availability: 'occupied'),
      );
      expect(chair.status, ChairStatus.maintenance);
      expect(chair.availability, ChairStatus.occupied);
    });
  });

  group('FaceProfileAnalysisStatus', () {
    Map<String, Object?> photo(String? status) => {
      'id': 'photo-1',
      'image_url': 'https://example.com/a.jpg',
      'is_primary': true,
      'analysis_status': ?status,
    };

    test('an unrecognised analysis status reads as absent', () {
      expect(FacePhotoDto.fromJson(photo('retrying')).analysisStatus, isNull);
    });

    test('known values still decode', () {
      expect(
        FacePhotoDto.fromJson(photo('completed')).analysisStatus,
        FaceProfileAnalysisStatus.completed,
      );
    });
  });

  group('BarberStatus and BranchStatus', () {
    test('a rejected staff member is rejected, not pending', () {
      final member = StaffMemberDto.fromJson({
        'id': 's1',
        'name': 'K',
        'status': 'rejected',
      });
      expect(member.status, BarberStatus.rejected);
      expect(member.isActive, isFalse);
    });

    test('a suspended branch value has its own member', () {
      expect(BranchStatus.suspended.value, 'suspended');
    });
  });
}
