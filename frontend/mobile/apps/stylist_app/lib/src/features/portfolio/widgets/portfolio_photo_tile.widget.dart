import 'package:core/core.dart';
import 'package:flutter/material.dart';

class PortfolioPhotoTile extends StatelessWidget {
  const PortfolioPhotoTile({
    super.key,
    required this.photo,
    required this.deleteLabel,
    required this.busy,
    required this.onDelete,
  });

  final PortfolioPhotoDto photo;
  final String deleteLabel;
  final bool busy;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) => Stack(
    fit: StackFit.expand,
    children: [
      Image.network(
        photo.url,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) =>
            const Icon(Icons.broken_image_outlined),
      ),
      PositionedDirectional(
        top: 0,
        end: 0,
        child: IconButton(
          tooltip: deleteLabel,
          onPressed: busy ? null : onDelete,
          icon: const Icon(Icons.delete_outline),
        ),
      ),
    ],
  );
}
