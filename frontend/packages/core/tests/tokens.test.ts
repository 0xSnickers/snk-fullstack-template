// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { darkColors, lightColors } from '../src/theme/tokens';

const css = readFileSync(
  fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)),
  'utf8',
);

function readBlock(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf('}', start));
  const entries = [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{3,8});/gi)].map(
    ([, name, value]) => [
      name!.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
      value!.toLowerCase(),
    ],
  );
  return Object.fromEntries(entries);
}

describe('design tokens', () => {
  it('tokens.ts matches tokens.css (light)', () => {
    const fromCss = readBlock(':root');
    for (const [key, value] of Object.entries(lightColors)) {
      expect(fromCss[key], key).toBe(value);
    }
  });

  it('tokens.ts matches tokens.css (dark overrides)', () => {
    for (const [key, value] of Object.entries(readBlock('.dark'))) {
      expect(darkColors[key as keyof typeof darkColors], key).toBe(value);
    }
  });
});
