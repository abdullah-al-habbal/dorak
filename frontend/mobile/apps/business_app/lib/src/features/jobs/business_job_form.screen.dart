import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.state.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';

/// Creates a posting, or edits [jobId] when it is given.
class BusinessJobFormScreen extends StatefulWidget {
  const BusinessJobFormScreen({super.key, required this.bloc, this.jobId});

  final BusinessJobsBloc bloc;
  final String? jobId;

  @override
  State<BusinessJobFormScreen> createState() => _BusinessJobFormScreenState();
}

class _BusinessJobFormScreenState extends State<BusinessJobFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleEn = TextEditingController();
  final _titleAr = TextEditingController();
  final _descriptionEn = TextEditingController();
  final _descriptionAr = TextEditingController();
  final _location = TextEditingController();
  final _type = TextEditingController();

  @override
  void initState() {
    super.initState();
    final job = widget.jobId == null
        ? null
        : widget.bloc.state.jobById(widget.jobId!);
    if (job == null) return;
    _titleEn.text = '${job.title['en'] ?? ''}';
    _titleAr.text = '${job.title['ar'] ?? ''}';
    _descriptionEn.text = '${job.description['en'] ?? ''}';
    _descriptionAr.text = '${job.description['ar'] ?? ''}';
    _location.text = job.location ?? '';
    _type.text = job.type ?? '';
  }

  @override
  void dispose() {
    _titleEn.dispose();
    _titleAr.dispose();
    _descriptionEn.dispose();
    _descriptionAr.dispose();
    _location.dispose();
    _type.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() != true) return;
    await widget.bloc.save({
      'title': {'en': _titleEn.text.trim(), 'ar': _titleAr.text.trim()},
      'description': {
        'en': _descriptionEn.text.trim(),
        'ar': _descriptionAr.text.trim(),
      },
      if (_location.text.trim().isNotEmpty) 'location': _location.text.trim(),
      if (_type.text.trim().isNotEmpty) 'type': _type.text.trim(),
    }, id: widget.jobId);
    if (mounted && widget.bloc.state.error == null) context.pop();
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    bool required = true,
    int maxLines = 1,
  }) => TextFormField(
    controller: controller,
    maxLines: maxLines,
    decoration: InputDecoration(labelText: label),
    validator: (value) {
      if (!required) return null;
      return value == null || value.trim().isEmpty
          ? AppLocalizations.of(context)!.businessJobFieldRequired
          : null;
    },
  );

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.jobId == null
              ? l10n.businessJobNewTitle
              : l10n.businessJobEditTitle,
        ),
      ),
      body: BlocBuilder<BusinessJobsBloc, BusinessJobsState>(
        bloc: widget.bloc,
        builder: (context, state) => Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _field(_titleEn, l10n.businessJobTitleEnglish),
              _field(_titleAr, l10n.businessJobTitleArabic),
              _field(
                _descriptionEn,
                l10n.businessJobDescriptionEnglish,
                maxLines: 3,
              ),
              _field(
                _descriptionAr,
                l10n.businessJobDescriptionArabic,
                maxLines: 3,
              ),
              _field(_location, l10n.businessJobLocation, required: false),
              _field(_type, l10n.businessJobType, required: false),
              if (state.error != null) FeatureError(error: state.error!),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: state.saving ? null : _submit,
                child: Text(l10n.businessSave),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
