import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_validators.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';

class SignUpFields extends StatelessWidget {
  const SignUpFields({
    super.key,
    required this.animation,
    required this.l10n,
    required this.isSubmitting,
    required this.nameController,
    required this.emailController,
    required this.passwordController,
    required this.confirmController,
    required this.serverError,
    required this.onSubmit,
  });

  final Animation<double> animation;
  final AppLocalizations l10n;
  final bool isSubmitting;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmController;
  final String? Function(String field) serverError;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AuthTextField(
          label: l10n.signUpFullNameLabel,
          controller: nameController,
          keyboardType: TextInputType.name,
          enabled: !isSubmitting,
          validator: (value) =>
              AuthValidators.required(value, l10n) ?? serverError('name'),
        ),
        const SizedBox(height: 16),
        AuthTextField(
          label: l10n.signUpEmailLabel,
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          enabled: !isSubmitting,
          validator: (value) =>
              AuthValidators.email(value, l10n) ?? serverError('email'),
        ),
        const SizedBox(height: 16),
        AuthTextField(
          label: l10n.signUpPasswordLabel,
          controller: passwordController,
          isPassword: true,
          enabled: !isSubmitting,
          helperText: l10n.signUpPasswordHint,
          validator: (value) =>
              AuthValidators.password(value, l10n) ?? serverError('password'),
        ),
        const SizedBox(height: 16),
        AuthTextField(
          label: l10n.signUpConfirmPasswordLabel,
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
