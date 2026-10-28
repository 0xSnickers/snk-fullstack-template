import { POST } from './route';

describe('POST /api/auth/login', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('never exposes the accessToken to the browser', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 0,
            message: 'ok',
            data: {
              accessToken: 'secret',
              user: { id: '1', name: 'A', email: null, role: 'user' },
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await POST(
      new Request('http://localhost/api/auth/login', { method: 'POST', body: '{}' }),
    );
    const body = await response.json();

    expect(body.data).toEqual({ user: { id: '1', name: 'A', email: null, role: 'user' } });
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
