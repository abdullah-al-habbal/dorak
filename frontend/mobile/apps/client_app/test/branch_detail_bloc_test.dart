import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeExploreRepository explore;
  late FakeBranchRepository branches;
  late FakeBookingRepository bookings;

  setUp(() {
    explore = FakeExploreRepository();
    branches = FakeBranchRepository();
    bookings = FakeBookingRepository();
  });

  BranchDetailBloc bloc() => BranchDetailBloc(
    explore,
    branches,
    bookings,
    FakeLocationProvider(),
    InMemoryAppPreferences(),
  );

  group('BranchDetailStarted', () {
    blocTest<BranchDetailBloc, BranchDetailState>(
      'loads detail and floor plan together',
      build: bloc,
      act: (bloc) => bloc.add(const BranchDetailStarted('1')),
      verify: (bloc) {
        expect(bloc.state.detail?.name, 'Branch 1');
        expect(bloc.state.plan?.chairs, hasLength(2));
        expect(bloc.state.isLoading, isFalse);
        expect(bloc.state.error, isNull);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'detail failure records the error',
      build: bloc,
      setUp: () => explore.error = offline(),
      act: (bloc) => bloc.add(const BranchDetailStarted('1')),
      verify: (bloc) {
        expect(bloc.state.detail, isNull);
        expect(bloc.state.error, isA<NetworkException>());
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'floor plan failure keeps the detail with a plan flag',
      build: bloc,
      setUp: () => branches.error = offline(),
      act: (bloc) => bloc.add(const BranchDetailStarted('1')),
      verify: (bloc) {
        expect(bloc.state.detail?.name, 'Branch 1');
        expect(bloc.state.plan, isNull);
        expect(bloc.state.planFailed, isTrue);
      },
    );
  });

  group('barber booking', () {
    blocTest<BranchDetailBloc, BranchDetailState>(
      'a barber-only booking sends barber_id, branch_id and services without a chair',
      build: bloc,
      act: (bloc) async {
        bloc.add(
          const BranchDetailStarted(
            '1',
            barberId: 'barber-1',
            serviceIds: ['service-1'],
          ),
        );
        await Future<void>.delayed(const Duration(milliseconds: 20));
        bloc
          ..add(BranchDetailDateChanged(DateTime.utc(2026, 9, 10)))
          ..add(BranchDetailSlotSelected(testSlotStart()));
        await Future<void>.delayed(const Duration(milliseconds: 20));
        bloc.add(const BranchDetailBookingSubmitted());
      },
      wait: const Duration(milliseconds: 50),
      verify: (bloc) {
        expect(bookings.createCalls, 1);
        expect(bookings.lastBarberId, 'barber-1');
        expect(bookings.lastBranchId, '1');
        expect(bookings.lastChairId, isNull);
        expect(bookings.lastServiceIds, ['service-1']);
      },
    );
  });

  group('service gate', () {
    blocTest<BranchDetailBloc, BranchDetailState>(
      'without a service canSubmit is false and no booking is created',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        selectedDate: DateTime.utc(2026, 9, 10),
        selectedChairId: 'chair-1',
        slots: testSlots(),
        selectedTime: testSlotStart(),
      ),
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      verify: (bloc) {
        expect(bloc.state.hasSelectedService, isFalse);
        expect(bloc.state.canSubmit, isFalse);
        expect(bookings.createCalls, 0);
      },
    );
  });

  group('selection', () {
    BranchDetailState seeded() => BranchDetailState(
      branchId: '1',
      detail: testBranchDetail(),
      plan: testFloorPlan(),
      selectedDate: DateTime.utc(2026, 9, 10),
      selectedServiceIds: const ['service-1'],
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'chair selection loads slots and records the chosen slot',
      build: bloc,
      seed: seeded,
      act: (bloc) {
        bloc
          ..add(const BranchDetailChairSelected('chair-1'))
          ..add(BranchDetailSlotSelected(testSlotStart()));
      },
      verify: (bloc) {
        expect(bloc.state.selectedChairId, 'chair-1');
        expect(bloc.state.slots, isNotEmpty);
        expect(bloc.state.selectedTime, testSlotStart());
        expect(bloc.state.canSubmit, isTrue);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'services selection is recorded and reloads slots',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        selectedDate: DateTime.utc(2026, 9, 10),
        selectedChairId: 'chair-1',
      ),
      act: (bloc) => bloc.add(const BranchDetailServicesChanged(['service-1'])),
      verify: (bloc) {
        expect(bloc.state.selectedServiceIds, ['service-1']);
        expect(bloc.state.slots, isNotEmpty);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'slots are not loaded until services are selected',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        selectedDate: DateTime.utc(2026, 9, 10),
        selectedChairId: 'chair-1',
      ),
      act: (bloc) => bloc.add(const BranchDetailChairSelected('chair-1')),
      verify: (bloc) {
        expect(bloc.state.slots, isEmpty);
      },
    );
  });

  group('BranchDetailBookingSubmitted', () {
    BranchDetailState ready() => BranchDetailState(
      branchId: '1',
      detail: testBranchDetail(),
      plan: testFloorPlan(),
      selectedChairId: 'chair-1',
      selectedServiceIds: const ['service-1'],
      slots: testSlots(),
      selectedTime: testSlotStart(),
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'successful booking marks succeeded with the chair barber',
      build: bloc,
      seed: ready,
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      verify: (bloc) {
        expect(bookings.createCalls, 1);
        expect(bloc.state.succeeded, isTrue);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'conflict records the submit error without succeeding',
      build: bloc,
      seed: ready,
      setUp: () => bookings.createError = const ApiException(
        statusCode: 409,
        code: 'CONFLICT',
        message: 'booking::messages.chair_not_available',
      ),
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      verify: (bloc) {
        expect(bloc.state.succeeded, isFalse);
        expect((bloc.state.submitError as ApiException).statusCode, 409);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'cannot submit a time that was not offered by the slot list',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        selectedChairId: 'chair-1',
        selectedServiceIds: const ['service-1'],
        slots: testSlots(),
        selectedTime: testSlotStart().add(const Duration(minutes: 7)),
      ),
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      expect: () => [],
      verify: (_) {
        expect(bookings.createCalls, 0);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'submit without a chair is a no-op',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        slots: testSlots(),
        selectedTime: testSlotStart(),
      ),
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      expect: () => [],
      verify: (_) {
        expect(bookings.createCalls, 0);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'submits a complete at-home address and GPS pin without a chair',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        isAtHomeBooking: true,
        preferredBarberId: 'barber-1',
        atHomeStreet: 'Al Hamra Street',
        atHomeBuilding: '12',
        atHomeUnit: '4B',
        atHomeLatitude: 33.8938,
        atHomeLongitude: 35.5018,
        slots: testSlots(startsAt: DateTime.utc(2026, 10, 1, 14, 30)),
        selectedTime: DateTime.utc(2026, 10, 1, 14, 30),
        selectedServiceIds: const ['service-1'],
      ),
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      verify: (_) {
        expect(bookings.createCalls, 1);
        expect(bookings.lastAtHomeStreet, 'Al Hamra Street');
        expect(bookings.lastAtHomeBuilding, '12');
        expect(bookings.lastAtHomeUnit, '4B');
        expect(bookings.lastAtHomeLatitude, 33.8938);
        expect(bookings.lastAtHomeLongitude, 35.5018);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'does not submit an at-home booking without a selected barber',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        isAtHomeBooking: true,
        atHomeStreet: 'Al Hamra Street',
        atHomeBuilding: '12',
        atHomeUnit: '4B',
        atHomeLatitude: 33.8938,
        atHomeLongitude: 35.5018,
        slots: testSlots(startsAt: DateTime.utc(2026, 10, 1, 14, 30)),
        selectedTime: DateTime.utc(2026, 10, 1, 14, 30),
        selectedServiceIds: const ['service-1'],
      ),
      act: (bloc) => bloc.add(const BranchDetailBookingSubmitted()),
      expect: () => [],
      verify: (_) {
        expect(bookings.createCalls, 0);
      },
    );

    blocTest<BranchDetailBloc, BranchDetailState>(
      'loads at-home barber slots with the client coordinates',
      build: bloc,
      seed: () => BranchDetailState(
        branchId: '1',
        detail: testBranchDetail(),
        plan: testFloorPlan(),
        isAtHomeBooking: true,
        preferredBarberId: 'barber-1',
        atHomeLatitude: 33.8938,
        atHomeLongitude: 35.5018,
        selectedServiceIds: const ['service-1'],
      ),
      act: (bloc) =>
          bloc.add(BranchDetailDateChanged(DateTime.utc(2026, 10, 1))),
      verify: (_) {
        expect(bookings.lastBarberSlotsId, 'barber-1');
        expect(bookings.lastBarberSlotsLatitude, 33.8938);
        expect(bookings.lastBarberSlotsLongitude, 35.5018);
      },
    );
  });
}
