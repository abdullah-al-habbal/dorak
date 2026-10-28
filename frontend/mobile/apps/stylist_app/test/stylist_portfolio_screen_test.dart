import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.screen.dart';
import 'package:stylist_app/src/features/portfolio/widgets/portfolio_photo_tile.widget.dart';

import 'helpers/stylist_fakes.dart';

void main() {
  testWidgets('grid adds a photo after upload and removes it after delete', (
    tester,
  ) async {
    final repository = FakeStylistOperationsRepository()
      ..portfolio = [const PortfolioPhotoDto(id: 'p1', url: 'http://x/p1.jpg')];
    final bloc = StylistPortfolioBloc(repository, FakePhotoPicker());
    addTearDown(bloc.close);

    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: StylistPortfolioScreen(bloc: bloc),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byType(PortfolioPhotoTile), findsOneWidget);

    await tester.tap(find.text('Add photo'));
    await tester.pumpAndSettle();

    expect(repository.uploadedPath, '/tmp/photo.jpg');
    expect(find.byType(PortfolioPhotoTile), findsNWidgets(2));

    await tester.tap(find.byTooltip('Delete photo').first);
    await tester.pumpAndSettle();

    expect(repository.deletedPhotoId, 'p1');
    expect(find.byType(PortfolioPhotoTile), findsOneWidget);
  });
}
