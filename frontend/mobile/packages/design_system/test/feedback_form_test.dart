import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:design_system/design_system.dart';

const _labels = FeedbackFormLabels(
  kindLabel: 'Type',
  messageLabel: 'Message',
  messageHint: 'Tell us more',
  messageTooShort: 'Too short',
  emailLabel: 'Email',
  emailInvalid: 'Bad email',
  submitLabel: 'Send',
);

const _kinds = [
  FeedbackKindOption(id: 'suggestion', label: 'Suggestion'),
  FeedbackKindOption(id: 'bug', label: 'Bug'),
];

Widget _harness({
  required ValueChanged<FeedbackFormValues> onSubmit,
  bool requireEmail = false,
  String? error,
  bool sending = false,
}) {
  return MaterialApp(
    theme: DorakTheme.light,
    home: Scaffold(
      body: SingleChildScrollView(
        child: FeedbackForm(
          kinds: _kinds,
          labels: _labels,
          onSubmit: onSubmit,
          requireEmail: requireEmail,
          errorMessage: error,
          isSending: sending,
        ),
      ),
    ),
  );
}

void main() {
  testWidgets('blocks a too-short message and does not call onSubmit', (
    tester,
  ) async {
    FeedbackFormValues? sent;
    await tester.pumpWidget(_harness(onSubmit: (v) => sent = v));

    await tester.enterText(find.byType(TextFormField).first, 'no');
    await tester.tap(find.text('Send'));
    await tester.pump();

    expect(find.text('Too short'), findsOneWidget);
    expect(sent, isNull);
  });

  testWidgets('submits the trimmed message and the chosen kind', (
    tester,
  ) async {
    FeedbackFormValues? sent;
    await tester.pumpWidget(_harness(onSubmit: (v) => sent = v));

    await tester.tap(find.text('Bug'));
    await tester.enterText(find.byType(TextFormField).first, '  It crashes  ');
    await tester.tap(find.text('Send'));
    await tester.pump();

    expect(sent?.kindId, 'bug');
    expect(sent?.message, 'It crashes');
    expect(sent?.email, isNull);
  });

  testWidgets('a guest must give a valid email', (tester) async {
    FeedbackFormValues? sent;
    await tester.pumpWidget(
      _harness(onSubmit: (v) => sent = v, requireEmail: true),
    );

    await tester.enterText(find.byType(TextFormField).first, 'It crashes');
    await tester.tap(find.text('Send'));
    await tester.pump();
    expect(find.text('Bad email'), findsOneWidget);
    expect(sent, isNull);

    await tester.enterText(find.byType(TextFormField).last, 'sam@example.com');
    await tester.tap(find.text('Send'));
    await tester.pump();
    expect(sent?.email, 'sam@example.com');
  });

  testWidgets('shows the sending error and disables the button while sending', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(onSubmit: (_) {}, error: 'Could not send', sending: true),
    );

    expect(find.text('Could not send'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
