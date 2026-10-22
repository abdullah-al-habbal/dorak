import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/rating_label.entity.dart';

void main() {
  late AppLocalizations en;
  late AppLocalizations ar;

  setUpAll(() async {
    en = await AppLocalizations.delegate.load(const Locale('en'));
    ar = await AppLocalizations.delegate.load(const Locale('ar'));
  });

  test('summarises an average with one decimal and the review count', () {
    expect(
      RatingLabel.of(en, average: 4.333, count: 3, localeCode: 'en'),
      '★ 4.3 (3 reviews)',
    );
    expect(
      RatingLabel.of(en, average: 5, count: 1, localeCode: 'en'),
      '★ 5.0 (1 review)',
    );
  });

  test('says there are no reviews yet when nothing is published', () {
    expect(
      RatingLabel.of(en, average: null, count: 0, localeCode: 'en'),
      'No reviews yet',
    );
    expect(
      RatingLabel.of(ar, average: null, count: 0, localeCode: 'ar'),
      'لا توجد مراجعات بعد',
    );
  });
}
