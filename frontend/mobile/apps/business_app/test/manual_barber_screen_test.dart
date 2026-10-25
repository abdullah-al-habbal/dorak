import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.screen.dart';
import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

class FakeManagedBarberRepository implements ManagedBarberRepository {
  String? lastPhone;

  @override
  Future<ManagedBarberDto> createManualBarber({
    required String nameEn,
    required String nameAr,
    required String phone,
    String? chairId,
  }) async {
    lastPhone = phone;
    return ManagedBarberDto(
      id: 'barber-1',
      name: {'en': nameEn, 'ar': nameAr},
      phone: phone,
      hasLogin: false,
    );
  }

  @override
  Future<ActivationLogDto> activateBarber(String barberId) async {
    return ActivationLogDto(
      id: 'log-1',
      activableId: barberId,
      activableType: 'barber',
      status: 'enabled',
    );
  }

  @override
  Future<ActivationLogDto> deactivateBarber(String barberId) async {
    return ActivationLogDto(
      id: 'log-1',
      activableId: barberId,
      activableType: 'barber',
      status: 'disabled',
    );
  }
}

void main() {
  testWidgets('normalizes the phone and creates a non-login barber', (
    tester,
  ) async {
    final repository = FakeManagedBarberRepository();
    final bloc = ManualBarberBloc(repository);
    addTearDown(bloc.close);

    await tester.pumpWidget(
      MaterialApp(
        theme: DorakTheme.forLocale(const Locale('en'), Brightness.light),
        locale: const Locale('en'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: BlocProvider.value(
          value: bloc,
          child: ManualBarberScreen(bloc: bloc),
        ),
      ),
    );

    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), 'Karim');
    await tester.enterText(fields.at(1), 'كريم');
    await tester.enterText(fields.at(2), '00 963 (944)-123-456');
    await tester.tap(find.text('Create barber'));
    await tester.pumpAndSettle();

    expect(repository.lastPhone, '+963944123456');
    expect(
      find.text('Barber created without a login account.'),
      findsOneWidget,
    );
  });
}
