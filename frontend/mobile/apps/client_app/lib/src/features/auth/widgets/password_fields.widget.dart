import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_validators.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';

class PasswordFields extends StatelessWidget {
  const PasswordFields({
    super.key,
    required this.animation,
    required this.passwordController,
    required this.confirmController,
    required this.isSubmitting,
    required this.onSubmit,
  });
  final Animation<double> animation;
  final TextEditingController passwordController;
  final TextEditingController confirmController;
  final bool isSubmitting;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return FadeTransition(
      opacity: animation,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AuthTextField(
            label: l10n.recoveryNewPasswordLabel,
            controller: passwordController,
            isPassword: true,
            enabled: !isSubmitting,
            helperText: l10n.signUpPasswordHint,
            validator: (value) => AuthValidators.password(value, l10n),
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: l10n.recoveryConfirmPasswordLabel,
            controller: confirmController,
            isPassword: true,
            enabled: !isSubmitting,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => onSubmit(),
            validator: (value) => AuthValidators.passwordConfirmation(
              value,
              passwordController.text,
              l10n,
            ),
          ),
        ],
      ),
    );
  }
}
