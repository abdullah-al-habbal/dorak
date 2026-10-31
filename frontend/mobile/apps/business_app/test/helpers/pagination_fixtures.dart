import 'package:core/core.dart';

/// Pagination metadata for repositories that always return an empty page.
class PaginationFixtures {
  const PaginationFixtures._();

  static const PaginationMeta emptyPage = PaginationMeta(
    total: 0,
    count: 0,
    perPage: 15,
    currentPage: 1,
    totalPages: 1,
  );
}
