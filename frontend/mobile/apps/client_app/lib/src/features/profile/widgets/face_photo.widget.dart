import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class FacePhoto extends StatefulWidget {
  const FacePhoto({
    super.key,
    required this.url,
    required this.placeholder,
    this.onExpired,
  });

  final String? url;
  final Widget placeholder;
  final VoidCallback? onExpired;

  @override
  State<FacePhoto> createState() => _FacePhotoState();
}

class _FacePhotoState extends State<FacePhoto> {
  bool _refreshRequested = false;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: DorakDimensions.radiusSm,
    child: SizedBox(
      width: 56,
      height: 56,
      child: widget.url == null
          ? widget.placeholder
          : Image.network(
              widget.url!,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                if (!_refreshRequested) {
                  _refreshRequested = true;
                  widget.onExpired?.call();
                }
                return widget.placeholder;
              },
            ),
    ),
  );
}
