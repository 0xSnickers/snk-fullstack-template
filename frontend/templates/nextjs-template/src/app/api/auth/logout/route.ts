import {
  fetchBackend,
  getForwardedHeaders,
  getRequestCookieHeader,
  toBffResponse,
} from '@/server/bff';

export async function POST(request: Request) {
  const result = await fetchBackend<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    headers: getForwardedHeaders(request),
    cookieHeader: getRequestCookieHeader(request),
    body: JSON.stringify({ clientType: 'web' }),
  });

  return toBffResponse(result);
}
