import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/errors/api_error.entity.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';

class BusinessLoginScreen extends StatefulWidget {
  const BusinessLoginScreen({
    super.key,
    required this.session,
    required this.onAuthenticated,
    required this.onLocaleToggle,
    required this.onForgotPassword,
    required this.role,
    required this.onRoleChanged,
    required this.onRegisterAsOwner,
  });

  final StaffSessionBloc session;
  final VoidCallback onAuthenticated;
  final VoidCallback onLocaleToggle;
  final VoidCallback onForgotPassword;
  final AppRole role;
  final ValueChanged<AppRole> onRoleChanged;
  final VoidCallback onRegisterAsOwner;

  @override
  State<BusinessLoginScreen> createState() => _BusinessLoginScreenState();
}

class _BusinessLoginScreenState extends State<BusinessLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  late AppRole _role = widget.role;

  void _selectRole(AppRole role) {
    setState(() => _role = role);
    widget.onRoleChanged(role);
  }

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
        title: Text(l10n.businessLoginTitle),
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
                      l10n.businessLoginTitle,
                      style: DorakTypography.headlineLgMobile.copyWith(
                        color: colors.onSurface,
                      ),
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    Text(
                      l10n.businessLoginSubtitle,
                      style: DorakTypography.bodyLg.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: DorakDimensions.spacingLarge),
                    Text(l10n.ownerRoleLabel),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    SegmentedButton<AppRole>(
                      segments: [
                        ButtonSegment(
                          value: AppRole.branch,
                          label: Text(l10n.ownerRoleBranch),
                        ),
                        ButtonSegment(
                          value: AppRole.owner,
                          label: Text(l10n.ownerRoleOwner),
                        ),
                      ],
                      selected: {_role},
                      onSelectionChanged: (selection) =>
                          _selectRole(selection.first),
                    ),
                    const SizedBox(height: DorakDimensions.spacingMedium),
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
                    TextButton(
                      onPressed: widget.onForgotPassword,
                      child: Text(l10n.loginForgotPassword),
                    ),
                    if (_role == AppRole.owner)
                      TextButton(
                        onPressed: widget.onRegisterAsOwner,
                        child: Text(l10n.ownerRegisterLink),
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
