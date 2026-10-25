import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_validators.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';

class LoginFields extends StatelessWidget {
  const LoginFields({
    super.key,
    required this.animation,
    required this.emailController,
    required this.passwordController,
    required this.isSubmitting,
    required this.serverError,
    required this.onSubmit,
  });
  final Animation<double> animation;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool isSubmitting;
  final String? Function(String) serverError;
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
            label: l10n.loginEmailLabel,
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            enabled: !isSubmitting,
            validator: (value) =>
                AuthValidators.email(value, l10n) ?? serverError('email'),
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: l10n.loginPasswordLabel,
            controller: passwordController,
            isPassword: true,
            enabled: !isSubmitting,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => onSubmit(),
            validator: (value) =>
                AuthValidators.required(value, l10n) ?? serverError('password'),
          ),
        ],
      ),
    );
  }
}
