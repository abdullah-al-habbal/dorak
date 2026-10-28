import 'package:core/core.dart';
import 'package:flutter/widgets.dart';

class JobTitle extends StatelessWidget {
  const JobTitle({super.key, required this.job});

  final JobPostingDto job;

  @override
  Widget build(BuildContext context) => Text(
    LocalizedName.resolve(
      job.title.map((key, value) => MapEntry(key, '$value')),
      Localizations.localeOf(context).languageCode,
    ),
  );
}
