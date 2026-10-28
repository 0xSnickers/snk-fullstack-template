import 'package:dio/dio.dart';

/// 应用内统一的接口错误类型，对应 Web 模板的 AppApiError。
/// 页面只需要处理 ApiException，不需要关心 Dio 的原始错误结构。
class ApiException implements Exception {
  const ApiException(this.message, {this.code, this.status, this.details});

  final String message;
  final Object? code;
  final int? status;
  final Object? details;

  bool get isUnauthorized => status == 401;

  factory ApiException.fromDio(DioException error) {
    final inner = error.error;
    if (inner is ApiException) return inner;

    final response = error.response;
    final data = response?.data;
    if (data is Map<String, dynamic>) {
      return ApiException(
        (data['message'] as String?) ?? error.message ?? 'Request failed',
        code: data['code'],
        status: response?.statusCode,
        details: data,
      );
    }

    return ApiException(
      error.message ?? 'Network error',
      code: error.type.name,
      status: response?.statusCode,
      details: data,
    );
  }

  @override
  String toString() => 'ApiException($status, $code): $message';
}
