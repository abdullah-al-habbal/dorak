/// Branch times (BG-55). The backend stores and sends instants in UTC, with the
/// branch clock's offset from UTC, so the apps need no time zone database.
abstract final class BranchClock {
  /// The instant as the branch's clock reads it, for formatting only: the result
  /// carries the branch's wall-clock fields, so never compare or send it. Without
  /// an offset (an older backend) the device's zone is used.
  static DateTime read(DateTime instant, int? utcOffsetMinutes) =>
      utcOffsetMinutes == null
      ? instant.toLocal()
      : instant.toUtc().add(Duration(minutes: utcOffsetMinutes));

  /// `yyyy-MM-dd` from the date's own fields: a picked calendar date means that
  /// day at the branch, whatever the device's zone (BG-56).
  static String calendarDate(DateTime date) =>
      '${_pad(date.year, 4)}-${_pad(date.month)}-${_pad(date.day)}';

  /// `yyyy-MM-ddTHH:mm` from the value's own fields: a picked time means that
  /// time on the branch's clock.
  static String wallClockMinute(DateTime value) =>
      '${calendarDate(value)}T${_pad(value.hour)}:${_pad(value.minute)}';

  static String _pad(int number, [int width = 2]) =>
      number.toString().padLeft(width, '0');
}
