import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

/// The feedback form. The app, platform, version, language and [screenKey] are sent
/// with the message; the sender is identified by the signed-in token, never by the form.
class FeedbackScreen extends StatelessWidget {
  const FeedbackScreen({
    super.key,
    required this.bloc,
    required this.screenKey,
    this.requireEmail = false,
  });

  final FeedbackBloc bloc;

  /// A lowercase key for where the form was opened, for example `profile/about`.
  final String screenKey;
  final bool requireEmail;

  static const _kinds = {
    'suggestion': FeedbackKind.suggestion,
    'bug': FeedbackKind.bug,
    'support': FeedbackKind.support,
  };

  String _failureMessage(AppLocalizations l10n, FeedbackFailure? failure) =>
      switch (failure) {
        FeedbackFailure.rateLimited => l10n.feedbackRateLimited,
        FeedbackFailure.network => l10n.errorNetwork,
        _ => l10n.feedbackFailed,
      };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final language = Localizations.localeOf(context).languageCode;
    final labels = {
      'suggestion': l10n.feedbackKindSuggestion,
      'bug': l10n.feedbackKindBug,
      'support': l10n.feedbackKindSupport,
    };

    return BlocConsumer<FeedbackBloc, FeedbackState>(
      bloc: bloc,
      listenWhen: (previous, current) => !previous.isSent && current.isSent,
      listener: (context, state) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.feedbackSent)));
        bloc.add(const FeedbackReset());
        Navigator.of(context).maybePop();
      },
      builder: (context, state) => Scaffold(
        appBar: AppBar(title: Text(l10n.feedbackTitle)),
        body: ListView(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          children: [
            FeedbackForm(
              kinds: [
                for (final id in _kinds.keys)
                  FeedbackKindOption(id: id, label: labels[id]!),
              ],
              labels: FeedbackFormLabels(
                kindLabel: l10n.feedbackKindLabel,
                messageLabel: l10n.feedbackMessageLabel,
                messageHint: l10n.feedbackMessageHint,
                messageTooShort: l10n.feedbackMessageTooShort,
                emailLabel: l10n.feedbackEmailLabel,
                emailInvalid: l10n.feedbackEmailInvalid,
                submitLabel: l10n.feedbackSubmit,
              ),
              requireEmail: requireEmail,
              isSending: state.isSending,
              errorMessage: state.status == FeedbackStatus.failed
                  ? _failureMessage(l10n, state.failure)
                  : null,
              onSubmit: (values) => bloc.add(
                FeedbackSubmitted(
                  kind: _kinds[values.kindId] ?? FeedbackKind.support,
                  message: values.message,
                  contactEmail: values.email,
                  locale: language,
                  screen: screenKey,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
