import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/auth/widgets/login_fields.widget.dart';
import 'package:client_app/src/features/auth/widgets/login_header.widget.dart';

class LoginContent extends StatefulWidget {
  final Animation<double> titleAnimation;
  final Animation<double> formAnimation;
  final Animation<double> actionsAnimation;
  final void Function(String email, String password) onSubmit;
  final AuthError? error;
  final bool isSubmitting;

  final VoidCallback? onForgotPassword;
  final VoidCallback onCreateAccount;
  final Widget? socialSection;

  const LoginContent({
    super.key,
    required this.titleAnimation,
    required this.formAnimation,
    required this.actionsAnimation,
    required this.onSubmit,
    required this.error,
    required this.isSubmitting,
    required this.onCreateAccount,
    this.onForgotPassword,
    this.socialSection,
  });

  @override
  State<LoginContent> createState() => _LoginContentState();
}

class _LoginContentState extends State<LoginContent> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant LoginContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.error != null && oldWidget.error == null) {
      _formKey.currentState?.validate();
    }
  }

  String? _serverError(String field) => widget.error?.firstErrorFor(field);

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    widget.onSubmit(_emailController.text.trim(), _passwordController.text);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final error = widget.error;

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LoginHeader(animation: widget.titleAnimation),
          const SizedBox(height: 32),
          LoginFields(
            animation: widget.formAnimation,
            emailController: _emailController,
            passwordController: _passwordController,
            isSubmitting: widget.isSubmitting,
            serverError: _serverError,
            onSubmit: _submit,
          ),
          const SizedBox(height: 4),
          FadeTransition(
            opacity: widget.actionsAnimation,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (widget.onForgotPassword != null)
                  Align(
                    alignment: AlignmentDirectional.centerEnd,
                    child: SkipButton(
                      label: l10n.loginForgotPassword,
                      onPressed: widget.onForgotPassword!,
                      isDisabled: widget.isSubmitting,
                    ),
                  ),
                if (error != null) ...[
                  const SizedBox(height: 8),
                  StatusBanner(message: error.message),
                ],
                const SizedBox(height: 16),
                PrimaryButton(
                  label: l10n.loginButton,
                  onPressed: _submit,
                  isLoading: widget.isSubmitting,
                ),
                if (widget.socialSection != null) ...[
                  const SizedBox(height: 16),
                  widget.socialSection!,
                ],
                const SizedBox(height: 16),
                Wrap(
                  alignment: WrapAlignment.center,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      l10n.loginSignUpPrompt,
                      style: DorakTypography.bodyMd.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                    TextButton(
                      onPressed: widget.isSubmitting
                          ? null
                          : widget.onCreateAccount,
                      style: TextButton.styleFrom(
                        foregroundColor: colors.primary,
                        textStyle: DorakTypography.labelLg,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(l10n.loginCreateAccountLink),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
