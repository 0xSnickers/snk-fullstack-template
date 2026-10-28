import { describe, expect, it, vi } from 'vitest';
import { createMemoryTokenStore } from '../src/auth/tokenStore';
import { loginSchema, registerSchema, validate } from '../src/auth/types';
import { booleanEnv, parseEnv } from '../src/config/envSchema';
import { baseMessages, mergeMessages } from '../src/i18n/messages';
import { matchLocale } from '../src/i18n/locales';
import { applyColorMode, applyTheme, themeInitScript } from '../src/theme/theme';
import { createTelemetryProxy } from '../src/telemetry/telemetry';
import { getNextValue } from '../src/utils/cycle';
import { singleFlight } from '../src/utils/singleFlight';
import { z } from 'zod';

describe('locales', () => {
  it('matches exact, language prefix and unsupported locales', () => {
    expect(matchLocale('en-US')).toBe('en-US');
    expect(matchLocale('en-GB')).toBe('en-US');
    expect(matchLocale('zh')).toBe('zh-CN');
    expect(matchLocale('fr-FR')).toBeNull();
    expect(matchLocale(undefined)).toBeNull();
  });
});

describe('messages', () => {
  it('keeps zh-CN and en-US keys in sync', () => {
    const keys = (value: object, prefix = ''): string[] =>
      Object.entries(value).flatMap(([key, child]) =>
        typeof child === 'object' ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`],
      );

    expect(keys(baseMessages['en-US']).sort()).toEqual(keys(baseMessages['zh-CN']).sort());
  });

  it('deep merges template messages', () => {
    const merged = mergeMessages(baseMessages['zh-CN'], {
      common: { appName: 'Demo' },
      extra: { a: 'b' },
    });
    expect(merged.common.appName).toBe('Demo');
    expect(merged.common.retry).toBe('重试');
    expect(merged.extra.a).toBe('b');
  });
});

describe('env helpers', () => {
  it('parses boolean strings and reports readable errors', () => {
    const schema = z.object({ FLAG: booleanEnv(), URL: z.string().url() });
    expect(parseEnv(schema, { FLAG: 'true', URL: 'http://a.com' }).FLAG).toBe(true);
    expect(parseEnv(schema, { FLAG: '', URL: 'http://a.com' }).FLAG).toBe(false);
    expect(() => parseEnv(schema, { URL: 'nope' })).toThrow(/URL/);
  });
});

describe('auth validation', () => {
  it('returns i18n keys for invalid fields', () => {
    const result = validate(registerSchema, { name: 'a', email: 'bad', password: '123' });
    expect(result).toEqual({
      success: false,
      errors: {
        name: 'auth.validation.nameLength',
        email: 'auth.validation.email',
        password: 'auth.validation.passwordLength',
      },
    });
    expect(validate(loginSchema, { email: 'a@b.com', password: '12345678' }).success).toBe(true);
  });
});

describe('utils', () => {
  it('cycles through values', () => {
    expect(getNextValue(['a', 'b', 'c'], 'c')).toBe('a');
  });

  it('shares one in-flight promise', async () => {
    const fn = vi.fn(async () => 1);
    const once = singleFlight(fn);
    await Promise.all([once(), once()]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('notifies token subscribers', () => {
    const store = createMemoryTokenStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.set('t');
    store.clear();
    expect(listener.mock.calls).toEqual([['t'], [null]]);
  });
});

describe('telemetry proxy', () => {
  it('swallows implementation errors and can be swapped', () => {
    const proxy = createTelemetryProxy();
    const track = vi.fn(() => {
      throw new Error('sdk down');
    });
    proxy.setImplementation({
      track,
      pageView: vi.fn(),
      captureError: vi.fn(),
      identify: vi.fn(),
      reset: vi.fn(),
      addBreadcrumb: vi.fn(),
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => proxy.track('x')).not.toThrow();
    expect(track).toHaveBeenCalledWith('x', undefined);
    warn.mockRestore();
  });
});

describe('theme (dom)', () => {
  it('applies brand colors and color mode', () => {
    applyTheme('violet');
    applyColorMode('dark');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#7c3aed');
    expect(root.classList.contains('dark')).toBe(true);
    applyColorMode('light');
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('produces an executable init script', () => {
    expect(() => new Function(themeInitScript)).not.toThrow();
  });
});
