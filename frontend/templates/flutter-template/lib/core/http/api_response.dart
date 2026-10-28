/// 分页结果，对应 core/http/types.ts 中的 PageResult。
class PageResult<T> {
  const PageResult({required this.items, required this.pagination});

  final List<T> items;
  final Pagination pagination;

  factory PageResult.fromJson(Object? json, T Function(Map<String, dynamic>) fromItem) {
    final map = json as Map<String, dynamic>;
    return PageResult(
      items: (map['items'] as List<dynamic>)
          .map((item) => fromItem(item as Map<String, dynamic>))
          .toList(),
      pagination: Pagination.fromJson(map['pagination'] as Map<String, dynamic>),
    );
  }
}

class Pagination {
  const Pagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory Pagination.fromJson(Map<String, dynamic> json) => Pagination(
        page: json['page'] as int,
        limit: json['limit'] as int,
        total: json['total'] as int,
        totalPages: json['totalPages'] as int,
      );
}
