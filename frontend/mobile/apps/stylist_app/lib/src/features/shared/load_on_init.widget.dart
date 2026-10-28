import 'package:flutter/widgets.dart';

class LoadOnInit extends StatefulWidget {
  const LoadOnInit({super.key, required this.onInit, required this.child});

  final VoidCallback onInit;
  final Widget child;

  @override
  State<LoadOnInit> createState() => _LoadOnInitState();
}

class _LoadOnInitState extends State<LoadOnInit> {
  @override
  void initState() {
    super.initState();
    widget.onInit();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
