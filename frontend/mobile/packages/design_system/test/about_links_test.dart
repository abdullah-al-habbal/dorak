import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:design_system/design_system.dart';

void main() {
  testWidgets('shows the links and the version and reports the tapped row', (
    tester,
  ) async {
    var opened = '';
    await tester.pumpWidget(
      MaterialApp(
        theme: DorakTheme.light,
        home: Scaffold(
          body: AboutLinks(
            title: 'About',
            versionLabel: 'Version 1.0.0+1',
            items: [
              AboutLinkItem(label: 'Privacy', onTap: () => opened = 'privacy'),
              AboutLinkItem(label: 'Terms', onTap: () => opened = 'terms'),
            ],
          ),
        ),
      ),
    );

    expect(find.text('Version 1.0.0+1'), findsOneWidget);
    await tester.tap(find.text('Terms'));
    expect(opened, 'terms');
  });

  testWidgets('hides an empty version', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: DorakTheme.light,
        home: const Scaffold(
          body: AboutLinks(title: 'About', items: [], versionLabel: ''),
        ),
      ),
    );

    expect(find.textContaining('Version'), findsNothing);
  });
}
