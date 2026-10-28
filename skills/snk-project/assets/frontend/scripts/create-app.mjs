#!/usr/bin/env node
/**
 * 从模板生成一个独立的新项目。
 *
 *   npm run create -- <模板> <目标目录> [--name 名称] [--force]
 *
 * 示例：
 *   npm run create -- react ../admin-web
 *   npm run create -- next ../official-site --name official-site
 *   npm run create -- uniapp ../shop-app
 *   npm run create -- flutter ../member_app
 *
 * 生成的项目：
 * - 不依赖本仓库，可以直接安装依赖、启动；
 * - core 代码归项目所有，可以直接修改；
 * - 自带 scripts/mock-server.mjs（需要 Node.js），可启动本地 Mock 后端；
 * - 自带 docs/ 通用开发规范（架构、约定、测试）。
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** kind: npm（Node 项目）/ flutter（Dart 项目） */
const TEMPLATES = {
  react: { dir: 'reactjs-template', kind: 'npm', start: 'npm run dev' },
  vue: { dir: 'vue3-template', kind: 'npm', start: 'npm run dev' },
  next: { dir: 'nextjs-template', kind: 'npm', start: 'npm run dev' },
  uniapp: { dir: 'uniapp-template', kind: 'npm', start: 'npm run dev:h5' },
  rn: { dir: 'react-native-template', kind: 'npm', start: 'npm run start' },
  flutter: { dir: 'flutter-template', kind: 'flutter' },
};
const ALIASES = {
  reactjs: 'react',
  vue3: 'vue',
  nextjs: 'next',
  uni: 'uniapp',
  'uni-app': 'uniapp',
  'react-native': 'rn',
  expo: 'rn',
};

const EXCLUDED = new Set([
  'node_modules',
  'dist',
  'unpackage',
  '.next',
  '.expo',
  'out',
  'build',
  'coverage',
  '.env',
  '.turbo',
  '.dart_tool',
  'next-env.d.ts',
  'expo-env.d.ts',
  '.DS_Store',
]);

function usage(message) {
  if (message) console.error(`\n✗ ${message}`);
  console.log(`
用法：npm run create -- <模板> <目标目录> [--name 名称] [--force]

Web 模板：
  react     React 19 + Vite SPA（管理后台、高交互业务系统）
  vue       Vue 3.5 + Vite SPA（中小型业务系统、快速交付）
  next      Next.js 16（官网、内容站、需要 SEO / SSR 的应用）

跨端模板（Android / iOS / H5）：
  uniapp    uni-app（Vue 3），还可编译小程序
  rn        React Native + Expo
  flutter   Flutter
`);
  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  const args = { positional: [], name: undefined, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') usage();
    else if (arg === '--force') args.force = true;
    else if (arg === '--name') args.name = argv[++i];
    else if (arg.startsWith('--name=')) args.name = arg.slice('--name='.length);
    else args.positional.push(arg);
  }
  return args;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const replaceInFile = (file, from, to) => {
  if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').split(from).join(to));
};

const toPackageName = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-~._/@]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Dart 包名：小写字母、数字、下划线，不能以数字开头。 */
const toDartPackageName = (value) => {
  const name = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return /^[a-z]/.test(name) ? name : `app_${name}`;
};

const GENERATED_HEADER = /^(\/\/|\/\*) 由 packages\/core 同步生成.*\n/;

const { positional, name, force } = parseArgs(process.argv.slice(2));
const [templateArg, targetArg] = positional;

if (!templateArg || !targetArg) usage('缺少参数');

const key = ALIASES[templateArg.toLowerCase()] ?? templateArg.toLowerCase();
const template = TEMPLATES[key];
if (!template) usage(`未知模板：${templateArg}`);

const templateDir = join(root, 'templates', template.dir);
const targetDir = resolve(process.cwd(), targetArg);

if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
  if (!force) usage(`目标目录已存在且不为空：${targetDir}（使用 --force 覆盖）`);
  rmSync(targetDir, { recursive: true, force: true });
}

// 1. 复制模板
mkdirSync(targetDir, { recursive: true });
cpSync(templateDir, targetDir, {
  recursive: true,
  filter: (source) => !EXCLUDED.has(basename(source)) && !source.endsWith('.tsbuildinfo'),
});

// 2. 通用开发文档、Mock 后端
cpSync(join(root, 'docs'), join(targetDir, 'docs'), { recursive: true });
mkdirSync(join(targetDir, 'scripts'), { recursive: true });
cpSync(join(root, 'scripts/mock-server.mjs'), join(targetDir, 'scripts/mock-server.mjs'));

let projectName;
let steps;

if (template.kind === 'npm') {
  projectName = toPackageName(name ?? basename(targetDir));

  // 3. core 归新项目所有：去掉「同步生成，请勿修改」的文件头
  const coreDir = join(targetDir, 'src/core');
  for (const file of walk(coreDir)) {
    writeFileSync(file, readFileSync(file, 'utf8').replace(GENERATED_HEADER, ''));
  }
  writeFileSync(
    join(coreDir, 'README.md'),
    `# src/core

框架无关的公共基础层：HTTP 客户端、错误归一化、Token、环境变量校验、语言、主题、设计 Token、遥测接口。

本目录由前端模板生成，现在归本项目所有，可以直接修改。
业务代码通过 \`@/core/...\` 引入，例如 \`import { AppApiError } from '@/core/http/apiError'\`。
`,
  );

  // 4. package.json
  const pkgPath = join(targetDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = projectName;
  pkg.version = '0.1.0';
  pkg.scripts = { ...pkg.scripts, mock: 'node scripts/mock-server.mjs' };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  if (existsSync(join(targetDir, '.env.example'))) {
    cpSync(join(targetDir, '.env.example'), join(targetDir, '.env'));
  }
  steps = ['npm install', 'npm run mock      # 可选：另开终端启动本地 Mock 后端', template.start];
} else {
  projectName = toDartPackageName(name ?? basename(targetDir));

  // 3. 生成文件归项目所有
  for (const file of walk(join(targetDir, 'lib/core/generated'))) {
    writeFileSync(file, readFileSync(file, 'utf8').replace(GENERATED_HEADER, ''));
  }
  replaceInFile(
    join(targetDir, 'l10n.yaml'),
    '# ARB 文件由模板仓库 `npm run sync:core` 从 core 语言包生成，与 Web / RN / uni-app 模板文案一致。',
    '# 语言包：修改 lib/l10n/*.arb 后运行 flutter gen-l10n（flutter run 时自动执行）。',
  );

  // 4. Dart 包名
  replaceInFile(join(targetDir, 'pubspec.yaml'), 'name: flutter_template', `name: ${projectName}`);
  replaceInFile(
    join(targetDir, 'tool/setup_platforms.sh'),
    '--project-name flutter_template',
    `--project-name ${projectName}`,
  );
  for (const file of walk(join(targetDir, 'test'))) {
    replaceInFile(file, 'package:flutter_template/', `package:${projectName}/`);
  }
  cpSync(join(targetDir, 'env/dev.example.json'), join(targetDir, 'env/dev.json'));
  steps = [
    './tool/setup_platforms.sh com.yourcompany   # 生成 android / ios / web 平台工程',
    'node scripts/mock-server.mjs                 # 可选：另开终端启动本地 Mock 后端',
    'flutter run --dart-define-from-file=env/dev.json',
  ];
}

// 5. README 标题
const readmePath = join(targetDir, 'README.md');
if (existsSync(readmePath)) {
  writeFileSync(
    readmePath,
    readFileSync(readmePath, 'utf8').replace(/^# .*$/m, `# ${projectName}`),
  );
}

const rel = relative(process.cwd(), targetDir) || '.';
console.log(`
✓ 已基于 ${template.dir} 创建项目：${targetDir}

下一步：
  cd ${rel}
${steps.map((step) => `  ${step}`).join('\n')}

Mock 账号：demo@example.com / password123
记得更新：README.md 项目说明、环境变量示例中的接口地址。
`);
