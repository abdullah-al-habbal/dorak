import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/widgets/sign_up_actions.widget.dart';
import 'package:client_app/src/features/auth/widgets/sign_up_fields.widget.dart';
import 'package:client_app/src/features/auth/widgets/sign_up_header.widget.dart';

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
  final ErrorFeedback? error;
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
          SignUpHeader(
            animation: widget.titleAnimation,
            l10n: l10n,
            colors: colors,
          ),
          const SizedBox(height: 32),
          SignUpFields(
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
          SignUpActions(
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
