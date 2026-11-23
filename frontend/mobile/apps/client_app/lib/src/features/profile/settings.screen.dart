import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/profile/settings.bloc.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({
    super.key,
    required this.repository,
    required this.currencyRepository,
  });

  final ProfileRepository repository;
  final CurrencyRepository currencyRepository;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final SettingsCubit _cubit;
  List<CurrencyDto> _currencies = const [];

  @override
  void initState() {
    super.initState();
    _cubit = SettingsCubit(widget.repository)..load();
    widget.currencyRepository.getCurrencies().then((currencies) {
      if (mounted) setState(() => _currencies = currencies);
    });
  }

  @override
  void dispose() {
    _cubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return BlocConsumer<SettingsCubit, SettingsState>(
      bloc: _cubit,
      listener: (context, state) {
        if (state.saved) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(l10n.profileSettingsSaved)));
        }
      },
      builder: (context, state) {
        final settings = state.settings;
        final error = state.error;
        return Scaffold(
          appBar: AppBar(title: Text(l10n.profileSettingsTitle)),
          body: state.isLoading || settings == null
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      DropdownButtonFormField<String>(
                        key: const Key('settings-language'),
                        initialValue: settings.preferredLanguage,
                        decoration: InputDecoration(
                          labelText: l10n.profileSettingsLanguageLabel,
                        ),
                        items: [
                          DropdownMenuItem(
                            value: LocaleCodes.english,
                            child: Text(l10n.profileSettingsLanguageEnglish),
                          ),
                          DropdownMenuItem(
                            value: LocaleCodes.arabic,
                            child: Text(l10n.profileSettingsLanguageArabic),
                          ),
                        ],
                        onChanged: (value) =>
                            _cubit.save(preferredLanguage: value),
                      ),
                      const SizedBox(height: DorakDimensions.spacingMedium),
                      DropdownButtonFormField<String>(
                        key: const Key('settings-currency'),
                        initialValue: settings.displayCurrencyCode,
                        decoration: InputDecoration(
                          labelText: l10n.profileSettingsCurrencyLabel,
                        ),
                        items: _currencies
                            .map(
                              (currency) => DropdownMenuItem(
                                value: currency.code,
                                child: Text(currency.code),
                              ),
                            )
                            .toList(growable: false),
                        onChanged: (value) =>
                            _cubit.save(displayCurrencyCode: value),
                      ),
                      const SizedBox(height: DorakDimensions.spacingMedium),
                      DropdownButtonFormField<String>(
                        key: const Key('settings-price-display-mode'),
                        initialValue: settings.priceDisplayMode,
                        decoration: InputDecoration(
                          labelText: l10n.profileSettingsPriceDisplayModeLabel,
                        ),
                        items: [
                          DropdownMenuItem(
                            value: 'tax_inclusive',
                            child: Text(
                              l10n.profileSettingsPriceDisplayModeTaxInclusive,
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'tax_exclusive',
                            child: Text(
                              l10n.profileSettingsPriceDisplayModeTaxExclusive,
                            ),
                          ),
                        ],
                        onChanged: (value) =>
                            _cubit.save(priceDisplayMode: value),
                      ),
                      if (error != null) ...[
                        const SizedBox(height: DorakDimensions.spacingMedium),
                        Text(
                          AuthError.from(error, l10n).message,
                          style: TextStyle(
                            color: DorakColors.of(context).error,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
        );
      },
    );
  }
}
