#!/usr/bin/env node
/**
 * 把 packages/core 同步到各模板。
 *
 *   node scripts/sync-core.mjs          # 同步
 *   node scripts/sync-core.mjs --check  # 只检查是否一致（CI 使用），不一致时退出码为 1
 *
 * - TypeScript 模板：复制 packages/core/src -> <模板>/src/core（可按模板排除不适用的文件）。
 * - Flutter 模板：由 core 的语言包、主题色、设计 Token 生成 ARB 和 Dart 文件。
 *
 * 为什么是「复制 / 生成」而不是 npm 包：模板会被整个复制出去成为独立项目，
 * 复制后的项目不应该依赖本仓库的 workspace。
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'packages/core/src');
const templatesDir = join(root, 'templates');
const checkOnly = process.argv.includes('--check');

/** 各模板的同步方式。不使用 Tailwind 的移动端模板排除 cn 和 tokens.css。 */
const TARGETS = {
  'reactjs-template': { kind: 'ts' },
  'vue3-template': { kind: 'ts' },
  'nextjs-template': { kind: 'ts' },
  'uniapp-template': { kind: 'ts', exclude: ['utils/cn.ts', 'styles/tokens.css'] },
  'react-native-template': { kind: 'ts', exclude: ['utils/cn.ts', 'styles/tokens.css'] },
  'flutter-template': { kind: 'dart' },
};

const GENERATED_NOTE =
  '由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。';
const HEADER = {
  '.ts': `// ${GENERATED_NOTE}\n`,
  '.css': `/* ${GENERATED_NOTE} */\n`,
  '.dart': `// ${GENERATED_NOTE}\n// ignore_for_file: type=lint\n\n`,
};

const README = `# src/core

框架无关的公共基础层：HTTP 客户端、错误归一化、Token、环境变量校验、语言、主题、设计 Token、遥测接口。

- 本目录由模板仓库的 \`packages/core\` 同步生成，**不要直接修改**。
- 如果项目已经从模板仓库复制出来独立维护，可以直接修改本目录，并删除本说明。
- 业务代码通过 \`@/core/...\` 引入，例如 \`import { AppApiError } from '@/core/http/apiError'\`。
`;

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// ---------------------------------------------------------------------------
// TypeScript 模板
// ---------------------------------------------------------------------------

function tsFiles(exclude = []) {
  const files = new Map();
  for (const file of walk(sourceDir)) {
    const rel = relative(sourceDir, file);
    if (exclude.includes(rel)) continue;
    const ext = rel.slice(rel.lastIndexOf('.'));
    files.set(rel, (HEADER[ext] ?? '') + readFileSync(file, 'utf8'));
  }
  files.set('README.md', README);
  return files;
}

// ---------------------------------------------------------------------------
// Flutter 模板：语言包 -> ARB，主题 / Token -> Dart
// ---------------------------------------------------------------------------

/** 用 TypeScript 编译器把无相对依赖的 TS 文件转成 JS 后加载。 */
async function importTs(file, replacements = {}) {
  let source = readFileSync(file, 'utf8');
  for (const [from, to] of Object.entries(replacements)) source = source.replace(from, to);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const camel = (parts) =>
  parts.map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join('');

function flatten(messages, prefix = []) {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object'
      ? flatten(value, [...prefix, key])
      : [[camel([...prefix, key]), value]],
  );
}

function toArb(locale, messages, withMetadata) {
  const arb = { '@@locale': locale };
  for (const [key, value] of flatten(messages)) {
    arb[key] = value;
    const placeholders = [...value.matchAll(/\{(\w+)\}/g)].map(([, name]) => name);
    if (withMetadata && placeholders.length > 0) {
      arb[`@${key}`] = {
        placeholders: Object.fromEntries(placeholders.map((name) => [name, { type: 'Object' }])),
      };
    }
  }
  return `${JSON.stringify(arb, null, 2)}\n`;
}

const dartColor = (hex) => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  return `Color(0xFF${full.toUpperCase()})`;
};

function toDartTokens({ lightColors, darkColors, radius, spacing, fontSize }, themes, locales) {
  const fields = Object.keys(lightColors);
  const instance = (colors) =>
    `AppColorTokens(\n${fields.map((key) => `    ${key}: ${dartColor(colors[key])},`).join('\n')}\n  )`;
  const numbers = (name, values) =>
    `abstract final class ${name} {\n${Object.entries(values)
      .map(([key, value]) => `  static const double ${key} = ${value};`)
      .join('\n')}\n}`;

  return `${HEADER['.dart']}import 'package:flutter/painting.dart';

/// 支持的语言（与 Web / RN / uni-app 模板一致）。
const supportedLocaleTags = <String>[${locales.map((l) => `'${l}'`).join(', ')}];

/// 语义色，对应 tokens.css / tokens.ts。
class AppColorTokens {
  const AppColorTokens({
${fields.map((key) => `    required this.${key},`).join('\n')}
  });

${fields.map((key) => `  final Color ${key};`).join('\n')}

  static const light = ${instance(lightColors)};

  static const dark = ${instance(darkColors)};
}

/// 品牌主题色，对应 theme.ts 中的 themes。
enum AppBrandTheme { ${Object.keys(themes).join(', ')} }

class BrandColors {
  const BrandColors({required this.primary, required this.secondary});

  final Color primary;
  final Color secondary;
}

const brandThemes = <AppBrandTheme, BrandColors>{
${Object.entries(themes)
  .map(
    ([name, colors]) =>
      `  AppBrandTheme.${name}: BrandColors(primary: ${dartColor(colors.primary)}, secondary: ${dartColor(colors.secondary)}),`,
  )
  .join('\n')}
};

${numbers('AppRadius', radius)}

${numbers('AppSpacing', spacing)}

${numbers('AppFontSize', fontSize)}
`;
}

async function dartFiles() {
  const zh = await importTs(join(sourceDir, 'i18n/messages/zh-CN.ts'));
  const en = await importTs(join(sourceDir, 'i18n/messages/en-US.ts'), {
    "import type { Messages } from './zh-CN';": 'type Messages = Record<string, unknown>;',
  });
  const tokens = await importTs(join(sourceDir, 'theme/tokens.ts'));
  const themeSource = readFileSync(join(sourceDir, 'theme/theme.ts'), 'utf8');
  const themes = Object.fromEntries(
    [...themeSource.matchAll(/(\w+): \{ primary: '(#\w+)', secondary: '(#\w+)' \}/g)].map(
      ([, name, primary, secondary]) => [name, { primary, secondary }],
    ),
  );
  const locales = [
    ...readFileSync(join(sourceDir, 'i18n/locales.ts'), 'utf8')
      .match(/locales = \[([^\]]+)\]/)[1]
      .matchAll(/'([\w-]+)'/g),
  ].map(([, locale]) => locale);

  return new Map([
    ['lib/l10n/app_zh.arb', toArb('zh', zh.zhCN, true)],
    ['lib/l10n/app_en.arb', toArb('en', en.enUS, false)],
    ['lib/core/generated/design_tokens.g.dart', toDartTokens(tokens, themes, locales)],
  ]);
}

// ---------------------------------------------------------------------------
// 执行
// ---------------------------------------------------------------------------

const templates = readdirSync(templatesDir).filter(
  (name) => TARGETS[name] && existsSync(join(templatesDir, name)),
);
let drift = 0;

for (const template of templates) {
  const config = TARGETS[template];
  const templateDir = join(templatesDir, template);

  if (config.kind === 'ts') {
    const targetDir = join(templateDir, 'src/core');
    const expected = tsFiles(config.exclude);
    const actual = walk(targetDir).map((file) => relative(targetDir, file));

    if (checkOnly) {
      for (const [rel, content] of expected) {
        const target = join(targetDir, rel);
        if (!existsSync(target) || readFileSync(target, 'utf8') !== content) {
          console.error(`✗ ${template}/src/core/${rel} 与 packages/core 不一致`);
          drift++;
        }
      }
      for (const rel of actual) {
        if (!expected.has(rel)) {
          console.error(`✗ ${template}/src/core/${rel} 不存在于 packages/core`);
          drift++;
        }
      }
      continue;
    }

    for (const rel of actual) if (!expected.has(rel)) rmSync(join(targetDir, rel));
    for (const [rel, content] of expected) {
      const target = join(targetDir, rel);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
    console.log(`✓ synced core -> templates/${template}/src/core (${expected.size} files)`);
    continue;
  }

  const expected = await dartFiles();
  for (const [rel, content] of expected) {
    const target = join(templateDir, rel);
    if (checkOnly) {
      if (!existsSync(target) || readFileSync(target, 'utf8') !== content) {
        console.error(`✗ ${template}/${rel} 与 packages/core 不一致`);
        drift++;
      }
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  if (!checkOnly) console.log(`✓ generated l10n + design tokens -> templates/${template}`);
}

if (checkOnly) {
  if (drift > 0) {
    console.error(`\n发现 ${drift} 处不一致，请运行 npm run sync:core。`);
    process.exit(1);
  }
  console.log(`✓ ${templates.length} 个模板与 packages/core 一致`);
}
