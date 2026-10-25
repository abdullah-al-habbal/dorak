import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up.state.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up_error.entity.dart';
import 'package:stylist_app/src/features/auth/widgets/step_heading.widget.dart';

class SignUpFormStep extends StatelessWidget {
  const SignUpFormStep({
    super.key,
    required this.formKey,
    required this.name,
    required this.email,
    required this.password,
    required this.confirmation,
    required this.isFreelancer,
    required this.onFreelancerChanged,
    required this.state,
    required this.l10n,
    required this.onSubmit,
    required this.onBackToLogin,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController name;
  final TextEditingController email;
  final TextEditingController password;
  final TextEditingController confirmation;
  final bool isFreelancer;
  final ValueChanged<bool> onFreelancerChanged;
  final StylistSignUpState state;
  final AppLocalizations l10n;
  final VoidCallback onSubmit;
  final VoidCallback onBackToLogin;

  @override
  Widget build(BuildContext context) => Form(
    key: formKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        StepHeading(
          title: l10n.stylistSignUpTitle,
          subtitle: l10n.stylistSignUpSubtitle,
        ),
        TextFormField(
          controller: name,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: l10n.signUpFullNameLabel),
          validator: (value) =>
              value == null || value.trim().isEmpty ? l10n.fieldRequired : null,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: email,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: l10n.signUpEmailLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.fieldRequired;
            }
            if (!value.contains('@') || !value.contains('.')) {
              return l10n.fieldInvalidEmail;
            }
            return null;
          },
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: password,
          obscureText: true,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(
            labelText: l10n.signUpPasswordLabel,
            helperText: l10n.signUpPasswordHint,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) return l10n.fieldRequired;
            if (value.length < 8) return l10n.fieldPasswordTooShort;
            return null;
          },
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: confirmation,
          obscureText: true,
          textInputAction: TextInputAction.done,
          decoration: InputDecoration(
            labelText: l10n.signUpConfirmPasswordLabel,
          ),
          validator: (value) =>
              value != password.text ? l10n.fieldPasswordMismatch : null,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(l10n.stylistSignUpFreelancerLabel),
          value: isFreelancer,
          onChanged: onFreelancerChanged,
        ),
        if (state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(message: StylistSignUpError.message(state.error!, l10n)),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.signUpButton,
          isLoading: state.isSubmitting,
          onPressed: onSubmit,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          onPressed: onBackToLogin,
          child: Text(
            '${l10n.signUpAlreadyHaveAccount} ${l10n.signUpLogInLink}',
          ),
        ),
      ],
    ),
  );
}
