import 'dart:convert';
import 'dart:io';

import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

/// D2 drift guard: `backend/tests/Fixtures/wire-enums.json` is kept equal to the backend
/// enums by the Pest `WireEnumFixtureTest`. A backend value this app has no member for
/// (it would read as unknown or as a wrong state) fails here.
Map<String, List<String>> _fixture() {
  final json =
      jsonDecode(
            File(
              '../../../../backend/tests/Fixtures/wire-enums.json',
            ).readAsStringSync(),
          )
          as Map<String, dynamic>;
  return {
    for (final entry in json.entries)
      entry.key: [for (final value in entry.value as List) value as String],
  };
}

void main() {
  final fixture = _fixture();

  void expectMirror(String name, Iterable<String> wireValues) {
    test('$name has exactly the backend values', () {
      expect(wireValues.toList()..sort(), [...?fixture[name]]..sort());
    });
  }

  expectMirror('BarberStatus', BarberStatus.values.map((v) => v.value));
  expectMirror(
    'AffiliationStatus',
    BarberAffiliationStatus.values
        .where((v) => v != BarberAffiliationStatus.unknown)
        .map((v) => v.wire),
  );
  expectMirror(
    'BookingStatus',
    BookingStatus.values
        .where((v) => v != BookingStatus.unknown)
        .map((v) => v.value),
  );
  expectMirror(
    'BranchHoursSource',
    BranchHoursSource.values.map((v) => v.value),
  );
  expectMirror('BranchStatus', BranchStatus.values.map((v) => v.value));
  expectMirror(
    'BranchStatus',
    OwnerBranchStatus.values
        .where((v) => v != OwnerBranchStatus.unknown)
        .map((v) => v.wire),
  );
  expectMirror(
    'BrandStatus',
    OwnerBrandStatus.values
        .where((v) => v != OwnerBrandStatus.unknown)
        .map((v) => v.wire),
  );
  expectMirror(
    'ChairStatus',
    ChairStatus.values
        .where((v) => v != ChairStatus.unknown)
        .map((v) => v.value),
  );
  expectMirror('FloorZone', FloorZone.values.map((v) => v.wire));
  expectMirror(
    'FaceAnalysisStatus',
    FaceProfileAnalysisStatus.values.map((v) => v.value),
  );
  expectMirror('VenueUniverse', VenueUniverse.values.map((v) => v.value));
  expectMirror(
    'ApplicationStatus',
    JobApplicationStatus.values
        .where((v) => v != JobApplicationStatus.unknown)
        .map((v) => v.wire),
  );
  expectMirror('ReviewStatus', ReviewStatus.values.map((v) => v.value));
  expectMirror(
    'ReviewSubjectType',
    ReviewSubjectType.values.map((v) => v.value),
  );
}
