import { getSafeRedirect } from './redirect';

describe('getSafeRedirect', () => {
  it.each([
    ['/orders?id=1', '/orders?id=1'],
    [null, '/'],
    ['https://evil.com', '/'],
    ['//evil.com', '/'],
    ['/\\evil.com', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(getSafeRedirect(input)).toBe(expected);
  });
});
