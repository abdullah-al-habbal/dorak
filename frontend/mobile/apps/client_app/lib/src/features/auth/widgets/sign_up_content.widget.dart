import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/auth/auth_validators.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';

class SignUpContent extends StatefulWidget {
  final Animation<double> titleAnimation;
  final Animation<double> formAnimation;
  final Animation<double> actionsAnimation;
  final void Function({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
  })
  onSubmit;
  final AuthError? error;
  final bool isSubmitting;
  final VoidCallback onLogInLink;

  const SignUpContent({
    super.key,
    required this.titleAnimation,
    required this.formAnimation,
    required this.actionsAnimation,
    required this.onSubmit,
    required this.error,
    required this.isSubmitting,
    required this.onLogInLink,
  });

  @override
  State<SignUpContent> createState() => _SignUpContentState();
}

class _SignUpContentState extends State<SignUpContent> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant SignUpContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.error != null && oldWidget.error == null) {
      _formKey.currentState?.validate();
    }
  }

  String? _serverError(String field) => widget.error?.firstErrorFor(field);

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    widget.onSubmit(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      passwordConfirmation: _confirmController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SignUpHeader(
            animation: widget.titleAnimation,
            l10n: l10n,
            colors: colors,
          ),
          const SizedBox(height: 32),
          _SignUpFields(
            animation: widget.formAnimation,
            l10n: l10n,
            isSubmitting: widget.isSubmitting,
            nameController: _nameController,
            emailController: _emailController,
            passwordController: _passwordController,
            confirmController: _confirmController,
            serverError: _serverError,
            onSubmit: _submit,
          ),
          const SizedBox(height: 24),
          _SignUpActions(
            animation: widget.actionsAnimation,
            l10n: l10n,
            colors: colors,
            error: widget.error,
            isSubmitting: widget.isSubmitting,
            onSubmit: _submit,
            onLogInLink: widget.onLogInLink,
          ),
        ],
      ),
    );
  }
}

class _SignUpHeader extends StatelessWidget {
  const _SignUpHeader({
    required this.animation,
    required this.l10n,
    required this.colors,
  });

  final Animation<double> animation;
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.signUpTitle,
          style: DorakTypography.headlineLgMobile.copyWith(
            color: colors.onSurface,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.signUpSubtitle,
          style: DorakTypography.bodyLg.copyWith(
            color: colors.onSurfaceVariant,
          ),
        ),
      ],
    ),
  );
}

class _SignUpFields extends StatelessWidget {
  const _SignUpFields({
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

class _SignUpActions extends StatelessWidget {
  const _SignUpActions({
    required this.animation,
    required this.l10n,
    required this.colors,
    required this.error,
    required this.isSubmitting,
    required this.onSubmit,
    required this.onLogInLink,
  });

  final Animation<double> animation;
  final AppLocalizations l10n;
  final DorakColors colors;
  final AuthError? error;
  final bool isSubmitting;
  final VoidCallback onSubmit;
  final VoidCallback onLogInLink;

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (error != null) ...[
          StatusBanner(message: error!.message),
          const SizedBox(height: 12),
        ],
        PrimaryButton(
          label: l10n.signUpButton,
          onPressed: onSubmit,
          isLoading: isSubmitting,
        ),
        const SizedBox(height: 16),
        Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              l10n.signUpAlreadyHaveAccount,
              style: DorakTypography.bodyMd.copyWith(
                color: colors.onSurfaceVariant,
              ),
            ),
            TextButton(
              onPressed: isSubmitting ? null : onLogInLink,
              style: TextButton.styleFrom(
                foregroundColor: colors.primary,
                textStyle: DorakTypography.labelLg,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(l10n.signUpLogInLink),
            ),
          ],
        ),
      ],
    ),
  );
}
