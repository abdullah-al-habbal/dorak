import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class HoursDayRow extends StatelessWidget {
  const HoursDayRow({
    super.key,
    required this.day,
    required this.dayName,
    required this.onClosedChanged,
    required this.onOpensChanged,
    required this.onClosesChanged,
  });

  final BranchOpeningHourDto day;
  final String dayName;
  final ValueChanged<bool> onClosedChanged;
  final ValueChanged<String> onOpensChanged;
  final ValueChanged<String> onClosesChanged;

  Future<void> _pick(
    BuildContext context,
    String current,
    ValueChanged<String> onPicked,
  ) async {
    final parts = current.split(':');
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(
        hour: int.parse(parts[0]),
        minute: int.parse(parts[1]),
      ),
    );
    if (picked == null) return;
    onPicked(
      '${picked.hour.toString().padLeft(2, '0')}:'
      '${picked.minute.toString().padLeft(2, '0')}',
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final opens = day.opensTime ?? '';
    final closes = day.closesTime ?? '';
    return Column(
      children: [
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(dayName),
          subtitle: day.isClosed ? Text(l10n.businessHoursClosed) : null,
          value: !day.isClosed,
          onChanged: (open) => onClosedChanged(!open),
        ),
        if (!day.isClosed)
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _pick(context, opens, onOpensChanged),
                  child: Text('${l10n.businessHoursOpens} $opens'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _pick(context, closes, onClosesChanged),
                  child: Text('${l10n.businessHoursCloses} $closes'),
                ),
              ),
            ],
          ),
      ],
    );
  }
}
