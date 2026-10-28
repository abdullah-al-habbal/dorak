import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/profile/stylist_profile.bloc.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.state.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistProfileScreen extends StatefulWidget {
  const StylistProfileScreen({super.key, required this.bloc});

  final StylistProfileBloc bloc;

  @override
  State<StylistProfileScreen> createState() => _StylistProfileScreenState();
}

class _StylistProfileScreenState extends State<StylistProfileScreen> {
  final _bioEnglish = TextEditingController();
  final _bioArabic = TextEditingController();

  @override
  void dispose() {
    _bioEnglish.dispose();
    _bioArabic.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: widget.bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistProfileTitle)),
        body: BlocBuilder<StylistProfileBloc, StylistProfileState>(
          bloc: widget.bloc,
          builder: (context, state) {
            if (state.loading && state.profile == null) {
              return const Center(child: CircularProgressIndicator());
            }
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (state.profile != null)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(state.profile!.name),
                    subtitle: Text(state.profile!.email),
                  ),
                TextField(
                  controller: _bioEnglish,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: l10n.stylistProfileBioEnglish,
                  ),
                ),
                TextField(
                  controller: _bioArabic,
                  maxLines: 3,
                  textDirection: TextDirection.rtl,
                  decoration: InputDecoration(
                    labelText: l10n.stylistProfileBioArabic,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  '${l10n.stylistTravelRadiusLabel}: '
                  '${l10n.stylistTravelRadiusValue(state.travelRadius.round().toString())}',
                ),
                Slider(
                  value: state.travelRadius,
                  max: StylistProfileBloc.maxTravelRadiusKm,
                  divisions: StylistProfileBloc.maxTravelRadiusKm.round(),
                  onChanged: widget.bloc.setTravelRadius,
                ),
                if (state.error != null) FeatureError(error: state.error!),
                if (state.saved) Text(l10n.stylistSaved),
                FilledButton(
                  onPressed: state.saving
                      ? null
                      : () => widget.bloc.save(
                          bioEnglish: _bioEnglish.text,
                          bioArabic: _bioArabic.text,
                        ),
                  child: Text(l10n.stylistSave),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
