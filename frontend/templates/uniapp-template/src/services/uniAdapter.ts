import axios, { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios';

type UniMethod = NonNullable<UniApp.RequestOptions['method']>;

/**
 * axios 的 uni.request 适配器：让 core 中的 createHttpClient 在 H5、App、小程序上运行同一套逻辑。
 * axios 负责拼接 URL、序列化参数和请求体，这里只负责发请求并把结果转成 axios 的响应 / 错误。
 */
export const uniAdapter: AxiosAdapter = (config) =>
  new Promise((resolve, reject) => {
    const headers = AxiosHeaders.from(config.headers).toJSON(true) as Record<string, string>;

    uni.request({
      url: axios.getUri(config),
      method: (config.method ?? 'get').toUpperCase() as UniMethod,
      data: config.data,
      header: headers,
      timeout: config.timeout || undefined,
      dataType: 'json',
      withCredentials: config.withCredentials,
      success(res) {
        const response: AxiosResponse = {
          data: res.data,
          status: res.statusCode,
          statusText: String(res.statusCode),
          headers: (res.header ?? {}) as AxiosResponse['headers'],
          config,
          request: null,
        };
        const validate =
          config.validateStatus ?? ((status: number) => status >= 200 && status < 300);

        if (validate(res.statusCode)) {
          resolve(response);
          return;
        }

        reject(
          new AxiosError(
            `Request failed with status code ${res.statusCode}`,
            res.statusCode >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
            config,
            null,
            response,
          ),
        );
      },
      fail(error) {
        const isTimeout = /timeout/i.test(error.errMsg ?? '');
        reject(
          new AxiosError(
            error.errMsg || 'Network Error',
            isTimeout ? AxiosError.ECONNABORTED : AxiosError.ERR_NETWORK,
            config,
          ),
        );
      },
    });
  });
