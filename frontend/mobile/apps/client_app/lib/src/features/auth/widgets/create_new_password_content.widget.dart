import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';

import 'package:client_app/src/features/auth/widgets/password_actions.widget.dart';
import 'package:client_app/src/features/auth/widgets/password_fields.widget.dart';
import 'package:client_app/src/features/auth/widgets/password_header.widget.dart';

class CreateNewPasswordContent extends StatefulWidget {
  final Animation<double> titleAnimation;
  final Animation<double> formAnimation;
  final Animation<double> actionsAnimation;
  final void Function({
    required String password,
    required String passwordConfirmation,
  })
  onSubmit;
  final ErrorFeedback? error;
  final bool isSubmitting;

  final bool isCodeRejected;
  final VoidCallback onReenterCode;

  const CreateNewPasswordContent({
    super.key,
    required this.titleAnimation,
    required this.formAnimation,
    required this.actionsAnimation,
    required this.onSubmit,
    required this.error,
    required this.isSubmitting,
    required this.isCodeRejected,
    required this.onReenterCode,
  });

  @override
  State<CreateNewPasswordContent> createState() =>
      _CreateNewPasswordContentState();
}

class _CreateNewPasswordContentState extends State<CreateNewPasswordContent> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    widget.onSubmit(
      password: _passwordController.text,
      passwordConfirmation: _confirmController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          PasswordHeader(animation: widget.titleAnimation),
          const SizedBox(height: 32),
          PasswordFields(
            animation: widget.formAnimation,
            passwordController: _passwordController,
            confirmController: _confirmController,
            isSubmitting: widget.isSubmitting,
            onSubmit: _submit,
          ),
          const SizedBox(height: 8),
          PasswordActions(
            animation: widget.actionsAnimation,
            error: widget.error,
            isCodeRejected: widget.isCodeRejected,
            onReenterCode: widget.onReenterCode,
            isSubmitting: widget.isSubmitting,
            onSubmit: _submit,
          ),
        ],
      ),
    );
  }
}
