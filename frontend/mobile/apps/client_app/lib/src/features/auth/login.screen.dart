import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/auth/social_credential.provider.dart';
import 'package:client_app/src/features/auth/social_login.bloc.dart';
import 'package:client_app/src/features/auth/social_login.event.dart';
import 'package:client_app/src/features/auth/social_login.state.dart';
import 'package:client_app/src/features/auth/widgets/social_login_buttons.widget.dart';
import 'package:client_app/src/features/auth/widgets/auth_entry_background.widget.dart';
import 'package:client_app/src/features/auth/widgets/auth_header.widget.dart';
import 'package:client_app/src/features/auth/widgets/auth_shell.widget.dart';
import 'package:client_app/src/features/auth/widgets/login_content.widget.dart';

class LoginScreen extends StatefulWidget {
  final AuthBloc auth;
  final SessionBloc session;
  final VoidCallback onCreateAccount;
  final VoidCallback? onLocaleToggle;

  final VoidCallback? onForgotPassword;
  final SocialLoginBloc? social;
  final SocialCredentialProvider? socialCredentials;

  const LoginScreen({
    super.key,
    required this.auth,
    required this.session,
    required this.onCreateAccount,
    this.onLocaleToggle,
    this.onForgotPassword,
    this.social,
    this.socialCredentials,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _fadeController;
  late final List<Animation<double>> _staggeredAnimations;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _staggeredAnimations = [
      CurvedAnimation(
        parent: _fadeController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
      CurvedAnimation(
        parent: _fadeController,
        curve: const Interval(0.1, 0.7, curve: Curves.easeOut),
      ),
      CurvedAnimation(
        parent: _fadeController,
        curve: const Interval(0.2, 0.8, curve: Curves.easeOut),
      ),
    ];
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Widget _socialSection(
    SocialLoginBloc social,
    SocialCredentialProvider credentials,
    AppLocalizations l10n,
    bool isSubmitting,
  ) {
    return BlocConsumer<SocialLoginBloc, SocialLoginState>(
      bloc: social,
      listener: (context, state) {
        final token = state.token;
        final provider = state.provider;
        if (state.status == SocialLoginStatus.credentialReady &&
            token != null &&
            provider != null) {
          widget.auth.add(
            SocialLoginSubmitted(provider: provider, token: token),
          );
        }
      },
      builder: (context, state) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (state.status == SocialLoginStatus.failed) ...[
            StatusBanner(message: l10n.socialLoginFailed),
            const SizedBox(height: DorakDimensions.spacingCozy),
          ],
          SocialLoginButtons(
            isSupported: credentials.supports,
            isBusy: state.isAuthenticating || isSubmitting,
            onPressed: (provider) => social.add(SocialLoginStarted(provider)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final isArabic =
        Localizations.localeOf(context).languageCode == LocaleCodes.arabic;

    return Scaffold(
      backgroundColor: colors.background,
      body: Stack(
        children: [
          const Positioned.fill(child: AuthEntryBackground()),
          AuthShell(
            pinnedHeader: true,
            header: AuthHeader(
              brandLabel: l10n.splashTitle,
              backTooltip: l10n.back,
              onBack: () => context.pop(),
              localeLabel: isArabic ? l10n.localeEnglish : l10n.localeArabic,
              onLocaleToggle: widget.onLocaleToggle,
            ),
            child: BlocBuilder<SessionBloc, SessionState>(
              bloc: widget.session,
              builder: (context, sessionState) =>
                  BlocBuilder<AuthBloc, AuthState>(
                    bloc: widget.auth,
                    builder: (context, state) {
                      final error =
                          sessionState.error is ApiException &&
                              (sessionState.error! as ApiException).code ==
                                  ApiErrorCodeConstants
                                      .apiErrorCodeAccountBanned
                          ? AuthError(message: l10n.authAccountSuspended)
                          : state.error == null
                          ? null
                          : AuthError.from(
                              state.error!,
                              l10n,
                              unauthorizedMessage:
                                  l10n.loginErrorInvalidCredentials,
                            );
                      final social = widget.social;
                      final credentials = widget.socialCredentials;
                      return LoginContent(
                        titleAnimation: _staggeredAnimations[0],
                        formAnimation: _staggeredAnimations[1],
                        actionsAnimation: _staggeredAnimations[2],
                        onSubmit: (email, password) => widget.auth.add(
                          LoginRequested(email: email, password: password),
                        ),
                        error: error,
                        isSubmitting: state.isSubmitting,
                        onForgotPassword: widget.onForgotPassword,
                        onCreateAccount: widget.onCreateAccount,
                        socialSection: social == null || credentials == null
                            ? null
                            : _socialSection(
                                social,
                                credentials,
                                l10n,
                                state.isSubmitting,
                              ),
                      );
                    },
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
