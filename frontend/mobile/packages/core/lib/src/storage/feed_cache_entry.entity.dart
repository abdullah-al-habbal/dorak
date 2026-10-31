import 'package:core/src/storage/feed_cache_constants.entity.dart';

class FeedCacheEntry {
  final List<Object?> items;
  final Map<String, dynamic> meta;
  final DateTime storedAt;

  const FeedCacheEntry({
    required this.items,
    required this.meta,
    required this.storedAt,
  });

  bool isStale(
    DateTime now, [
    Duration ttl = FeedCacheConstants.feedCacheDefaultTtl,
  ]) => now.difference(storedAt) > ttl;
}
