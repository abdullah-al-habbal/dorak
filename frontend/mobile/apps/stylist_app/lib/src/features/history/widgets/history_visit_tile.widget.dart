import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/history/history_media_type.entity.dart';

class HistoryVisitTile extends StatelessWidget {
  const HistoryVisitTile({
    super.key,
    required this.visit,
    required this.canAttach,
    required this.uploading,
    required this.onAttach,
    required this.l10n,
  });

  final ServiceHistoryDto visit;
  final bool canAttach;
  final bool uploading;
  final VoidCallback onAttach;
  final AppLocalizations l10n;

  String _title(BuildContext context) {
    final names = visit.catalogItem?.name;
    if (names == null || names.isEmpty) return l10n.stylistHistoryVisitFallback;
    final code = Localizations.localeOf(context).languageCode;
    return names[code] ?? names[LocaleCodes.english] ?? names.values.first;
  }

  String? _typeLabel(String? type) => switch (type) {
    HistoryMediaType.before => l10n.historyMediaTypeBefore,
    HistoryMediaType.after => l10n.historyMediaTypeAfter,
    HistoryMediaType.reference => l10n.historyMediaTypeReference,
    _ => null,
  };

  @override
  Widget build(BuildContext context) {
    final performedAt = visit.performedAtOnBranchClock;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _title(context),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (performedAt != null)
              Text(
                MaterialLocalizations.of(context).formatMediumDate(performedAt),
              ),
            if (visit.media.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final media in visit.media)
                    _MediaThumbnail(
                      key: ValueKey(media.id),
                      media: media,
                      label: _typeLabel(media.photoType),
                    ),
                ],
              ),
            ],
            if (canAttach) ...[
              const SizedBox(height: 8),
              if (uploading)
                const SizedBox.square(
                  dimension: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              else
                TextButton.icon(
                  onPressed: onAttach,
                  icon: const Icon(Icons.add_a_photo_outlined),
                  label: Text(l10n.historyAttachPhotoAction),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MediaThumbnail extends StatelessWidget {
  const _MediaThumbnail({super.key, required this.media, required this.label});

  final HistoryMediaDto media;
  final String? label;

  static const double _size = 72;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Image.network(
        media.photoUrl,
        width: _size,
        height: _size,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) =>
            const SizedBox.square(dimension: _size, child: Icon(Icons.image)),
      ),
      if (label != null)
        Text(label!, style: Theme.of(context).textTheme.labelSmall),
    ],
  );
}
