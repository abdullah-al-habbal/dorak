import 'package:flutter/material.dart';

class BookingVisualStagger extends StatelessWidget {
  const BookingVisualStagger({
    super.key,
    required this.animation,
    required this.child,
  });
  final Animation<double> animation;
  final Widget child;

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, .05),
        end: Offset.zero,
      ).animate(animation),
      child: child,
    ),
  );
}
