import 'package:core/core.dart';
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
  final _tagsEn = TextEditingController();
  final _tagsAr = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.bloc.load();
  }

  void _fill(BranchProfileTextsDto texts) {
    _descriptionEn.text = texts.description[LocaleCodes.english] ?? '';
    _descriptionAr.text = texts.description[LocaleCodes.arabic] ?? '';
    _addressEn.text = texts.address[LocaleCodes.english] ?? '';
    _addressAr.text = texts.address[LocaleCodes.arabic] ?? '';
    _tagsEn.text = texts.tags
        .map((tag) => tag[LocaleCodes.english] ?? '')
        .join(', ');
    _tagsAr.text = texts.tags
        .map((tag) => tag[LocaleCodes.arabic] ?? '')
        .join(', ');
  }

  @override
  void dispose() {
    _descriptionEn.dispose();
    _descriptionAr.dispose();
    _addressEn.dispose();
    _addressAr.dispose();
    _tagsEn.dispose();
    _tagsAr.dispose();
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
      body: BlocConsumer<BusinessProfileBloc, BusinessProfileState>(
        bloc: widget.bloc,
        listenWhen: (previous, current) =>
            previous.texts == null && current.texts != null,
        listener: (context, state) => _fill(state.texts!),
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
            _field(_tagsEn, l10n.businessProfileTagsEnglish),
            _field(_tagsAr, l10n.businessProfileTagsArabic),
            if (state.error != null) FeatureError(error: state.error!),
            if (state.saved) Text(l10n.commonSaved),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: state.saving
                  ? null
                  : () => widget.bloc.save(
                      descriptionEnglish: _descriptionEn.text,
                      descriptionArabic: _descriptionAr.text,
                      addressEnglish: _addressEn.text,
                      addressArabic: _addressAr.text,
                      tagsEnglish: _tagsEn.text,
                      tagsArabic: _tagsAr.text,
                    ),
              child: Text(l10n.businessSave),
            ),
          ],
        ),
      ),
    );
  }
}
