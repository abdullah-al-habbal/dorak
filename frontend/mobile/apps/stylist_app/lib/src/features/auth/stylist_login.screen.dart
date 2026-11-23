import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/errors/api_error.entity.dart';

class StylistLoginScreen extends StatefulWidget {
  const StylistLoginScreen({
    super.key,
    required this.session,
    required this.onAuthenticated,
    required this.onLocaleToggle,
    required this.onSignUp,
    required this.onForgotPassword,
  });

  final StaffSessionBloc session;
  final VoidCallback onAuthenticated;
  final VoidCallback onLocaleToggle;
  final VoidCallback onSignUp;
  final VoidCallback onForgotPassword;

  @override
  State<StylistLoginScreen> createState() => _StylistLoginScreenState();
}

class _StylistLoginScreenState extends State<StylistLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() != true) return;
    await widget.session.login(
      email: _email.text.trim(),
      password: _password.text,
    );
    if (mounted && widget.session.state.isAuthenticated) {
      widget.onAuthenticated();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.stylistLoginTitle),
        actions: [
          TextButton(
            onPressed: widget.onLocaleToggle,
            child: Text(
              Localizations.localeOf(context).languageCode ==
                      LocaleCodes.english
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
            child: BlocBuilder<StaffSessionBloc, StaffSessionState>(
              bloc: widget.session,
              builder: (context, state) => Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      l10n.stylistLoginTitle,
                      style: DorakTypography.headlineLgMobile.copyWith(
                        color: colors.onSurface,
                      ),
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    Text(
                      l10n.stylistLoginSubtitle,
                      style: DorakTypography.bodyLg.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: DorakDimensions.spacingLarge),
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      decoration: InputDecoration(
                        labelText: l10n.loginEmailLabel,
                      ),
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
                      controller: _password,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: InputDecoration(
                        labelText: l10n.loginPasswordLabel,
                      ),
                      validator: (value) => value == null || value.isEmpty
                          ? l10n.fieldRequired
                          : null,
                    ),
                    if (state.error != null) ...[
                      const SizedBox(height: DorakDimensions.spacingMedium),
                      StatusBanner(
                        message: ApiError.from(
                          state.error!,
                          l10n,
                          fallbackMessage: l10n.loginErrorInvalidCredentials,
                        ).message,
                      ),
                    ],
                    const SizedBox(height: DorakDimensions.spacingLarge),
                    PrimaryButton(
                      label: l10n.loginButton,
                      isLoading: state.isSubmitting,
                      onPressed: _submit,
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    TextButton(
                      onPressed: widget.onForgotPassword,
                      child: Text(l10n.loginForgotPassword),
                    ),
                    TextButton(
                      onPressed: widget.onSignUp,
                      child: Text(l10n.stylistSignUpLink),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
