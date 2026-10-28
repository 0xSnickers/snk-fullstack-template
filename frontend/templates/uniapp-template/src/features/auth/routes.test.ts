import { getSafeRedirect, routes, withRedirect } from './routes';

describe('getSafeRedirect', () => {
  it.each([
    ['/pages/profile/index', '/pages/profile/index'],
    [encodeURIComponent('/pages/profile/index?id=1'), '/pages/profile/index?id=1'],
    [null, routes.home],
    ['https://evil.com', routes.home],
    ['/pages//evil', routes.home],
    ['/other/page', routes.home],
  ])('%s -> %s', (input, expected) => {
    expect(getSafeRedirect(input)).toBe(expected);
  });

  it('builds login url with encoded redirect', () => {
    expect(withRedirect(routes.login, routes.profile)).toBe(
      '/pages/login/index?redirect=%2Fpages%2Fprofile%2Findex',
    );
  });
});
