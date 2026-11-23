import 'package:business_app/src/features/operations/widgets/chair_tile.widget.dart';
import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

void main() {
  for (final locale in AppLocalizations.supportedLocales) {
    testWidgets('an unknown chair status reads as a chair status in $locale', (
      tester,
    ) async {
      final l10n = lookupAppLocalizations(locale);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChairTile(
              chair: const FloorChairDto(
                id: 'chair-1',
                label: 'A',
                status: ChairStatus.unknown,
              ),
              l10n: l10n,
              onStatusChanged: (_) {},
            ),
          ),
        ),
      );

      expect(find.textContaining(l10n.chairStatusUnknown), findsOneWidget);
      expect(l10n.chairStatusUnknown, isNot(''));
    });
  }
}
