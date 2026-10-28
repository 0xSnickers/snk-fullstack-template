import { getServerSession } from '@/features/auth/server/session';
import { GET, POST } from './route';

vi.mock('@/features/auth/server/session', () => ({ getServerSession: vi.fn() }));

const fetchMock = vi.fn();

function context(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe('BFF catch-all route', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 0, message: 'ok', data: { items: [] } }), {
        status: 200,
        headers: { 'set-cookie': 'sid=1; HttpOnly' },
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it('forwards to backend with bearer token when signed in', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      accessToken: 'server-token',
      user: { id: '1', name: 'A', email: null, role: 'user' },
    });

    const response = await GET(
      new Request('http://localhost/api/users?page=2', { headers: { 'accept-language': 'en-US' } }),
      context(['users']),
    );

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('http://localhost:9000/api/v1/users?page=2');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer server-token');
    expect(new Headers(init.headers).get('accept-language')).toBe('en-US');
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('sid=1');
    await expect(response.json()).resolves.toMatchObject({ data: { items: [] } });
  });

  it('forwards anonymously with body when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    await POST(
      new Request('http://localhost/api/orders', { method: 'POST', body: '{"a":1}' }),
      context(['orders']),
    );

    const [, init] = fetchMock.mock.calls[0]!;
    expect(new Headers(init.headers).has('authorization')).toBe(false);
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
  });

  it('returns 502 when backend is unreachable', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const response = await GET(new Request('http://localhost/api/users'), context(['users']));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ code: 'BACKEND_UNAVAILABLE' });
  });
});
