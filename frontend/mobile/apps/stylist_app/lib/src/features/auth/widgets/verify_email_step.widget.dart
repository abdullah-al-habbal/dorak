import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up.state.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up_error.entity.dart';
import 'package:stylist_app/src/features/auth/widgets/step_heading.widget.dart';

class VerifyEmailStep extends StatelessWidget {
  const VerifyEmailStep({
    super.key,
    required this.formKey,
    required this.code,
    required this.state,
    required this.l10n,
    required this.onVerify,
    required this.onResend,
    required this.onSkip,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController code;
  final StylistSignUpState state;
  final AppLocalizations l10n;
  final VoidCallback onVerify;
  final VoidCallback onResend;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) => Form(
    key: formKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        StepHeading(
          title: l10n.verifyTitle,
          subtitle: l10n.verifySubtitle(state.email),
        ),
        TextFormField(
          controller: code,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(labelText: l10n.stylistVerifyCodeLabel),
          validator: (value) => value == null || value.trim().length != 6
              ? l10n.verifyErrorInvalid
              : null,
        ),
        if (state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(message: StylistSignUpError.message(state.error!, l10n)),
        ] else if (state.codeResent) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          Text(l10n.stylistVerifyCodeResent),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.verifyButton,
          isLoading: state.isSubmitting,
          onPressed: onVerify,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          onPressed: state.isSubmitting ? null : onResend,
          child: Text(l10n.verifyResend),
        ),
        TextButton(
          onPressed: state.isSubmitting ? null : onSkip,
          child: Text(l10n.verifySkip),
        ),
      ],
    ),
  );
}
