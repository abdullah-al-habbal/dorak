import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

/// About and legal: the public pages, the version, the feedback form.
class AboutSupportScreen extends StatelessWidget {
  const AboutSupportScreen({
    super.key,
    required this.legalLinks,
    required this.onFeedback,
    this.linkOpener = const UrlLauncherExternalLinkOpener(),
    this.appInfo = const PackageInfoAppInfoProvider(),
  });

  final LegalLinks legalLinks;
  final VoidCallback onFeedback;
  final ExternalLinkOpener linkOpener;
  final AppInfoProvider appInfo;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final language = Localizations.localeOf(context).languageCode;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.aboutLegalTitle)),
      body: ListView(
        padding: const EdgeInsets.all(DorakDimensions.marginMobile),
        children: [
          FutureBuilder<String>(
            future: appInfo.version(),
            builder: (context, snapshot) {
              final version = snapshot.data ?? '';
              return AboutLinks(
                title: l10n.aboutLegalTitle,
                versionLabel: version.isEmpty
                    ? null
                    : l10n.appVersionLabel(version),
                items: [
                  AboutLinkItem(
                    label: l10n.legalPrivacyPolicy,
                    onTap: () => ExternalLinkFeedback.open(
                      context,
                      linkOpener,
                      legalLinks.privacy(language),
                    ),
                  ),
                  AboutLinkItem(
                    label: l10n.legalTermsOfService,
                    onTap: () => ExternalLinkFeedback.open(
                      context,
                      linkOpener,
                      legalLinks.terms(language),
                    ),
                  ),
                  AboutLinkItem(
                    label: l10n.legalAboutDorak,
                    onTap: () => ExternalLinkFeedback.open(
                      context,
                      linkOpener,
                      legalLinks.about(language),
                    ),
                  ),
                  AboutLinkItem(
                    label: l10n.legalContactUs,
                    onTap: () => ExternalLinkFeedback.open(
                      context,
                      linkOpener,
                      legalLinks.contact(language),
                    ),
                  ),
                  AboutLinkItem(
                    label: l10n.legalDeleteAccountInfo,
                    onTap: () => ExternalLinkFeedback.open(
                      context,
                      linkOpener,
                      legalLinks.deleteAccount(language),
                    ),
                  ),
                ],
              );
            },
          ),
          const Divider(),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.feedback_outlined),
            title: Text(l10n.feedbackEntry),
            trailing: const Icon(Icons.chevron_right),
            onTap: onFeedback,
          ),
        ],
      ),
    );
  }
}
