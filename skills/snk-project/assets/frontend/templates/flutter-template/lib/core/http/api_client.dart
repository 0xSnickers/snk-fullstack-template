import 'dart:math';

import 'package:dio/dio.dart';

import '../utils/single_flight.dart';
import 'api_exception.dart';

typedef TokenGetter = String? Function();
typedef LocaleGetter = String? Function();
typedef RefreshHandler = Future<String> Function(Dio bare);
typedef ErrorReporter = void Function(ApiException error, RequestOptions request);

/// 应用唯一的 HTTP 客户端，行为与 Web 模板的 core/http/createHttpClient 一致：
/// - 注入 X-Request-ID、Accept-Language、Authorization；
/// - 统一响应 `{ code, message, data }`：业务码非 0 / 200 抛出 [ApiException]，成功时返回 data；
/// - 401 时自动刷新 Token 并重试一次，并发 401 只刷新一次；刷新失败调用 [onUnauthorized]。
///
/// 业务接口写在 `lib/features/<模块>/data/*_api.dart`，不要在页面中直接使用 Dio。
class ApiClient {
  ApiClient({
    required String baseUrl,
    required TokenGetter getAccessToken,
    LocaleGetter? getLocale,
    Duration timeout = const Duration(seconds: 10),
    List<String> authEndpoints = const ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'],
  })  : _getAccessToken = getAccessToken,
        _getLocale = getLocale,
        _authEndpoints = authEndpoints {
    final options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: timeout,
      receiveTimeout: timeout,
      contentType: Headers.jsonContentType,
      responseType: ResponseType.json,
    );
    dio = Dio(options);
    bare = Dio(options);
    dio.interceptors.add(
      InterceptorsWrapper(onRequest: _onRequest, onResponse: _onResponse, onError: _onError),
    );
  }

  /// 带拦截器的 Dio 实例，需要原始响应（下载文件、读取响应头）时使用。
  late final Dio dio;

  /// 不带拦截器的 Dio 实例，仅用于刷新 Token 等引导请求。
  late final Dio bare;

  final TokenGetter _getAccessToken;
  final LocaleGetter? _getLocale;
  final List<String> _authEndpoints;
  final _random = Random();

  SingleFlight<String>? _refresh;

  /// 登录失效（刷新失败或无法刷新）时的回调，由鉴权模块注册：清空用户、跳转登录。
  void Function()? onUnauthorized;

  /// 错误上报（遥测），401 不会上报。
  ErrorReporter? onError;

  /// 注册 Token 刷新逻辑；未注册时 401 直接视为登录失效。
  set refreshHandler(RefreshHandler? handler) {
    _refresh = handler == null ? null : SingleFlight(() => handler(bare));
  }

  Future<T> get<T>(String path, {Map<String, dynamic>? query, required T Function(Object? data) decode}) =>
      _send(() => dio.get<Object?>(path, queryParameters: query), decode);

  Future<T> post<T>(String path, {Object? body, required T Function(Object? data) decode}) =>
      _send(() => dio.post<Object?>(path, data: body), decode);

  Future<T> put<T>(String path, {Object? body, required T Function(Object? data) decode}) =>
      _send(() => dio.put<Object?>(path, data: body), decode);

  Future<T> patch<T>(String path, {Object? body, required T Function(Object? data) decode}) =>
      _send(() => dio.patch<Object?>(path, data: body), decode);

  Future<T> delete<T>(String path, {Object? body, required T Function(Object? data) decode}) =>
      _send(() => dio.delete<Object?>(path, data: body), decode);

  /// 解包 `{ code, message, data }`；后端未包裹时原样返回。
  static Object? unwrap(Object? body) {
    if (body is Map<String, dynamic> && body.containsKey('code') && body.containsKey('data')) {
      if (!isSuccessCode(body['code'])) {
        throw ApiException((body['message'] as String?) ?? 'Request failed', code: body['code'], details: body);
      }
      return body['data'];
    }
    return body;
  }

  static bool isSuccessCode(Object? code) => code == 0 || code == 200 || code == '0' || code == '200';

  Future<T> _send<T>(Future<Response<Object?>> Function() request, T Function(Object? data) decode) async {
    try {
      final response = await request();
      return decode(unwrap(response.data));
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  bool _isAuthEndpoint(String path) => _authEndpoints.any(path.contains);

  String _requestId() =>
      '${DateTime.now().microsecondsSinceEpoch.toRadixString(16)}-${_random.nextInt(0x7fffffff).toRadixString(16)}';

  void _onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['X-Request-ID'] = _requestId();
    final locale = _getLocale?.call();
    if (locale != null) options.headers['Accept-Language'] = locale;
    final token = _getAccessToken();
    if (token != null && token.isNotEmpty) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  void _onResponse(Response<dynamic> response, ResponseInterceptorHandler handler) {
    final data = response.data;
    if (data is Map<String, dynamic> && data.containsKey('code') && !isSuccessCode(data['code'])) {
      final error = ApiException(
        (data['message'] as String?) ?? 'Request failed',
        code: data['code'],
        status: response.statusCode,
        details: data,
      );
      onError?.call(error, response.requestOptions);
      handler.reject(
        DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: error,
        ),
      );
      return;
    }
    handler.next(response);
  }

  Future<void> _onError(DioException error, ErrorInterceptorHandler handler) async {
    final status = error.response?.statusCode;
    final request = error.requestOptions;

    if (status != 401) {
      if (error.error is! ApiException) onError?.call(ApiException.fromDio(error), request);
      handler.next(error);
      return;
    }

    final canRefresh = _refresh != null && request.extra['retried'] != true && !_isAuthEndpoint(request.path);

    if (canRefresh) {
      final String token;
      try {
        token = await _refresh!();
      } catch (_) {
        onUnauthorized?.call();
        handler.next(error);
        return;
      }

      request
        ..extra['retried'] = true
        ..headers['Authorization'] = 'Bearer $token';
      try {
        handler.resolve(await dio.fetch<dynamic>(request));
      } on DioException catch (retryError) {
        handler.next(retryError);
      }
      return;
    }

    if (!_isAuthEndpoint(request.path)) onUnauthorized?.call();
    handler.next(error);
  }
}
