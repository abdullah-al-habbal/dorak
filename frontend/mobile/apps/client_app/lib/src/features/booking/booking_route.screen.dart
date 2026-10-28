import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class BookingRouteScreen extends StatefulWidget {
  const BookingRouteScreen({
    super.key,
    required this.bookingId,
    required this.repository,
    required this.builder,
    this.initial,
  });

  final String bookingId;
  final BookingRepository repository;
  final BookingDto? initial;
  final Widget Function(BookingDto booking) builder;

  @override
  State<BookingRouteScreen> createState() => _BookingRouteScreenState();
}

class _BookingRouteScreenState extends State<BookingRouteScreen> {
  late Future<BookingDto> _booking;

  @override
  void initState() {
    super.initState();
    _booking = _resolve();
  }

  Future<BookingDto> _resolve() async {
    final initial = widget.initial;
    if (initial != null && initial.id == widget.bookingId) return initial;
    return widget.repository.getBooking(widget.bookingId);
  }

  void _retry() => setState(() => _booking = _resolve());

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<BookingDto>(
      future: _booking,
      builder: (context, snapshot) {
        final booking = snapshot.data;
        if (booking != null) return widget.builder(booking);
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(),
            body: Center(
              child: TextButton(
                onPressed: _retry,
                child: Text(AppLocalizations.of(context)!.actionRetry),
              ),
            ),
          );
        }
        return Scaffold(
          appBar: AppBar(),
          body: const Center(child: CircularProgressIndicator()),
        );
      },
    );
  }
}
