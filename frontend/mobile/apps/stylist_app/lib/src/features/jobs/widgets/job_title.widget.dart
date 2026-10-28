import 'package:core/core.dart';
import 'package:flutter/widgets.dart';

class JobTitle extends StatelessWidget {
  const JobTitle({super.key, required this.job, this.style});

  final JobPostingDto job;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) => Text(
    LocalizedName.resolve(
      job.title.map((key, value) => MapEntry(key, '$value')),
      Localizations.localeOf(context).languageCode,
    ),
    style: style,
  );
}
