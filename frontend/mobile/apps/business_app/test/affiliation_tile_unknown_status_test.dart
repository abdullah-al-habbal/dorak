import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';
import 'package:business_app/src/features/affiliations/widgets/affiliation_tile.widget.dart';

void main() {
  for (final locale in AppLocalizations.supportedLocales) {
    testWidgets(
      'an unknown affiliation status is not shown as terminated in $locale',
      (tester) async {
        final l10n = lookupAppLocalizations(locale);

        await tester.pumpWidget(
          MaterialApp(
            locale: locale,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
            home: Scaffold(
              body: AffiliationTile(
                affiliation: const BarberAffiliationDto(
                  id: 'a1',
                  barberId: 'barber-1',
                  affiliableId: 'branch-1',
                  affiliableType: 'branch',
                  status: BarberAffiliationStatus.unknown,
                ),
                busy: false,
                onAccept: () {},
                onReject: () {},
              ),
            ),
          ),
        );

        expect(find.text(l10n.affiliationStatusUnknown), findsOneWidget);
        expect(
          find.text(l10n.businessAffiliationStatusTerminated),
          findsNothing,
        );
      },
    );
  }
}
