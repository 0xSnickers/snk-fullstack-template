import 'package:flutter_template/core/http/api_client.dart';
import 'package:flutter_template/core/http/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers.dart';

void main() {
  String? token;

  ApiClient createClient(FakeAdapter adapter) {
    final client = ApiClient(baseUrl: 'https://api.example.com', getAccessToken: () => token, getLocale: () => 'zh-CN');
    client.dio.httpClientAdapter = adapter;
    client.bare.httpClientAdapter = adapter;
    return client;
  }

  setUp(() => token = 'token-1');

  test('injects headers and unwraps the response envelope', () async {
    final adapter = FakeAdapter((_) => (status: 200, body: ok({'id': 1})));
    final client = createClient(adapter);

    final data = await client.get('/users/1', decode: (data) => data! as Map<String, dynamic>);

    expect(data, {'id': 1});
    final headers = adapter.requests.single.headers;
    expect(headers['Authorization'], 'Bearer token-1');
    expect(headers['Accept-Language'], 'zh-CN');
    expect(headers['X-Request-ID'], isNotNull);
  });

  test('throws ApiException for business error codes', () async {
    final client = createClient(
      FakeAdapter((_) => (status: 200, body: {'code': 4001, 'message': '余额不足', 'data': null})),
    );

    expect(
      () => client.post<void>('/orders', decode: (_) {}),
      throwsA(isA<ApiException>().having((e) => e.code, 'code', 4001).having((e) => e.message, 'message', '余额不足')),
    );
  });

  test('refreshes once for concurrent 401 responses and retries', () async {
    var refreshCount = 0;
    final adapter = FakeAdapter((options) {
      final authorized = options.headers['Authorization'] == 'Bearer fresh';
      return authorized
          ? (status: 200, body: ok(options.path))
          : (status: 401, body: {'code': 'UNAUTHORIZED', 'message': 'expired', 'data': null});
    });
    final client = createClient(adapter)
      ..refreshHandler = (_) async {
        refreshCount++;
        await Future<void>.delayed(const Duration(milliseconds: 10));
        token = 'fresh';
        return 'fresh';
      };

    final results = await Future.wait([
      client.get('/a', decode: (data) => data! as String),
      client.get('/b', decode: (data) => data! as String),
    ]);

    expect(results, ['/a', '/b']);
    expect(refreshCount, 1);
  });

  test('calls onUnauthorized when refresh fails', () async {
    var unauthorized = 0;
    final client = createClient(FakeAdapter((_) => (status: 401, body: {'code': 401, 'message': 'expired', 'data': null})))
      ..refreshHandler = (_) async => throw const ApiException('refresh failed', status: 401)
      ..onUnauthorized = () => unauthorized++;

    await expectLater(
      client.get<void>('/me', decode: (_) {}),
      throwsA(isA<ApiException>().having((e) => e.status, 'status', 401)),
    );
    expect(unauthorized, 1);
  });
}
