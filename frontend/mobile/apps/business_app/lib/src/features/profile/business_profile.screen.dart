import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.state.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';

class BusinessProfileScreen extends StatefulWidget {
  const BusinessProfileScreen({super.key, required this.bloc});

  final BusinessProfileBloc bloc;

  @override
  State<BusinessProfileScreen> createState() => _BusinessProfileScreenState();
}

class _BusinessProfileScreenState extends State<BusinessProfileScreen> {
  final _descriptionEn = TextEditingController();
  final _descriptionAr = TextEditingController();
  final _addressEn = TextEditingController();
  final _addressAr = TextEditingController();
  final _tags = TextEditingController();

  @override
  void dispose() {
    _descriptionEn.dispose();
    _descriptionAr.dispose();
    _addressEn.dispose();
    _addressAr.dispose();
    _tags.dispose();
    super.dispose();
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    int lines = 1,
  }) => TextField(
    controller: controller,
    maxLines: lines,
    decoration: InputDecoration(labelText: label),
  );

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.businessProfileTitle)),
      body: BlocBuilder<BusinessProfileBloc, BusinessProfileState>(
        bloc: widget.bloc,
        builder: (context, state) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _field(
              _descriptionEn,
              l10n.businessProfileDescriptionEnglish,
              lines: 3,
            ),
            _field(
              _descriptionAr,
              l10n.businessProfileDescriptionArabic,
              lines: 3,
            ),
            _field(_addressEn, l10n.businessProfileAddressEnglish),
            _field(_addressAr, l10n.businessProfileAddressArabic),
            _field(_tags, l10n.businessProfileTags),
            if (state.error != null) FeatureError(error: state.error!),
            if (state.saved) Text(l10n.businessSaved),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: state.saving
                  ? null
                  : () => widget.bloc.save(
                      descriptionEnglish: _descriptionEn.text,
                      descriptionArabic: _descriptionAr.text,
                      addressEnglish: _addressEn.text,
                      addressArabic: _addressAr.text,
                      tags: _tags.text,
                    ),
              child: Text(l10n.businessSave),
            ),
          ],
        ),
      ),
    );
  }
}
