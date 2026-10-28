import { AppApiError } from '@/core/http/apiError';
import { createHttpClient } from '@/core/http/createHttpClient';
import { uniAdapter } from './uniAdapter';

type RequestOptions = UniApp.RequestOptions;

function setup(reply: (options: RequestOptions) => void) {
  vi.mocked(uni.request).mockImplementation(((options: RequestOptions) => {
    reply(options);
    return {} as UniApp.RequestTask;
  }) as typeof uni.request);
  const http = createHttpClient({
    baseURL: 'https://api.example.com/v1',
    getAccessToken: () => 'token',
  });
  http.instance.defaults.adapter = uniAdapter;
  return http;
}

describe('uniAdapter', () => {
  it('sends url, query, headers and body through uni.request', async () => {
    let captured: RequestOptions | undefined;
    const http = setup((options) => {
      captured = options;
      options.success?.({
        data: { code: 0, message: 'ok', data: [1] },
        statusCode: 200,
        header: {},
        cookies: [],
      });
    });

    await expect(http.post('/orders', { a: 1 }, { params: { page: 2 } })).resolves.toEqual([1]);
    expect(captured?.url).toBe('https://api.example.com/v1/orders?page=2');
    expect(captured?.method).toBe('POST');
    expect((captured?.header as Record<string, string>).Authorization).toBe('Bearer token');
    expect(captured?.data).toBe('{"a":1}');
  });

  it('turns HTTP errors into AppApiError with status', async () => {
    const http = setup((options) =>
      options.success?.({
        data: { code: 'NOT_FOUND', message: '不存在', data: null },
        statusCode: 404,
        header: {},
        cookies: [],
      }),
    );

    await expect(http.get('/missing')).rejects.toMatchObject({ status: 404, message: '不存在' });
  });

  it('turns network failures into AppApiError', async () => {
    const http = setup((options) => options.fail?.({ errMsg: 'request:fail timeout' }));

    await expect(http.get('/slow')).rejects.toBeInstanceOf(AppApiError);
  });
});
