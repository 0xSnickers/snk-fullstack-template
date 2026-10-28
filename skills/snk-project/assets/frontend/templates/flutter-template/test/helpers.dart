import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';

/// 不发真实请求的 Dio 适配器：按请求返回预设响应。
class FakeAdapter implements HttpClientAdapter {
  FakeAdapter(this.handler);

  final ({int status, Object? body}) Function(RequestOptions options) handler;
  final requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    final reply = handler(options);
    return ResponseBody.fromString(
      jsonEncode(reply.body),
      reply.status,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

Map<String, Object?> ok(Object? data) => {'code': 0, 'message': 'success', 'data': data};
