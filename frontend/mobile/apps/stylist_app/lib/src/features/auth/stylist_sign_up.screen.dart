import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.state.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up_step.entity.dart';
import 'package:stylist_app/src/features/auth/widgets/pending_approval_step.widget.dart';
import 'package:stylist_app/src/features/auth/widgets/sign_up_form_step.widget.dart';
import 'package:stylist_app/src/features/auth/widgets/verify_email_step.widget.dart';

class StylistSignUpScreen extends StatefulWidget {
  const StylistSignUpScreen({
    super.key,
    required this.signUp,
    required this.onBackToLogin,
    required this.onLocaleToggle,
  });

  final StylistSignUpBloc signUp;
  final VoidCallback onBackToLogin;
  final VoidCallback onLocaleToggle;

  @override
  State<StylistSignUpScreen> createState() => _StylistSignUpScreenState();
}

class _StylistSignUpScreenState extends State<StylistSignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeFormKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();
  final _code = TextEditingController();
  bool _isFreelancer = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirmation.dispose();
    _code.dispose();
    super.dispose();
  }

  void _register() {
    if (_formKey.currentState?.validate() != true) return;
    widget.signUp.register(
      name: _name.text.trim(),
      email: _email.text.trim(),
      password: _password.text,
      passwordConfirmation: _confirmation.text,
      isFreelancer: _isFreelancer,
    );
  }

  void _verify() {
    if (_codeFormKey.currentState?.validate() != true) return;
    widget.signUp.verifyEmail(_code.text.trim());
  }

  void _backToLogin() {
    widget.signUp.reset();
    widget.onBackToLogin();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: _backToLogin),
        actions: [
          TextButton(
            onPressed: widget.onLocaleToggle,
            child: Text(
              Localizations.localeOf(context).languageCode == 'en'
                  ? l10n.localeArabic
                  : l10n.localeEnglish,
            ),
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: BlocBuilder<StylistSignUpBloc, StylistSignUpState>(
              bloc: widget.signUp,
              builder: (context, state) => switch (state.step) {
                StylistSignUpStep.form => SignUpFormStep(
                  formKey: _formKey,
                  name: _name,
                  email: _email,
                  password: _password,
                  confirmation: _confirmation,
                  isFreelancer: _isFreelancer,
                  onFreelancerChanged: (value) =>
                      setState(() => _isFreelancer = value),
                  state: state,
                  l10n: l10n,
                  onSubmit: _register,
                  onBackToLogin: _backToLogin,
                ),
                StylistSignUpStep.verifyEmail => VerifyEmailStep(
                  formKey: _codeFormKey,
                  code: _code,
                  state: state,
                  l10n: l10n,
                  onVerify: _verify,
                  onResend: widget.signUp.resendCode,
                  onSkip: widget.signUp.skipVerification,
                ),
                StylistSignUpStep.pending => PendingApprovalStep(
                  l10n: l10n,
                  onBackToLogin: _backToLogin,
                ),
              },
            ),
          ),
        ),
      ),
    );
  }
}
