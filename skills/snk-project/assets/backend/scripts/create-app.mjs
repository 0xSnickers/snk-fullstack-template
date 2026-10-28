#!/usr/bin/env node
/**
 * 从模板生成一个独立的新项目（不依赖本仓库）。
 *
 *   node scripts/create-app.mjs <express|nestjs|django|gin|springboot> <目标目录> [--name my-api] [--module github.com/acme/my-api]
 *
 * 会做的事：复制模板（跳过依赖、构建产物、日志、.env）→ 改项目名 / 数据库名 → 附带 docs/API_CONTRACT.md。
 */
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = ['express', 'nestjs', 'django', 'gin', 'springboot'];
const SKIP = new Set(['node_modules', 'dist', '.venv', 'target', 'bin', 'logs', '.env', 'db.sqlite3', '__pycache__', '.pytest_cache', '.ruff_cache', 'coverage']);

function usage(message) {
  if (message) console.error(`error: ${message}\n`);
  console.error('usage: node scripts/create-app.mjs <express|nestjs|django|gin|springboot> <target-dir> [--name my-api] [--module github.com/acme/my-api]');
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const nameFlag = flag('name');
const moduleFlag = flag('module');
const [kind, target] = args;

if (!TEMPLATES.includes(kind)) usage(`unknown template "${kind ?? ''}"`);
if (!target) usage('missing target directory');

const dest = resolve(target);
if (existsSync(dest) && readdirSync(dest).length > 0) usage(`${dest} exists and is not empty`);

const name = nameFlag ?? basename(dest);
if (!/^[a-z][a-z0-9-]*$/.test(name)) usage(`project name "${name}" must match ^[a-z][a-z0-9-]*$ (use --name)`);
const dbName = name.replace(/-/g, '_');
const src = join(ROOT, 'templates', `${kind}-template`);
const templateDb = `${kind}_template`;

cpSync(src, dest, { recursive: true, filter: (p) => !SKIP.has(basename(p)) });
cpSync(join(ROOT, 'docs', 'API_CONTRACT.md'), join(dest, 'docs', 'API_CONTRACT.md'));

/** Applies string replacements to every text file under dest. */
function replaceAll(pairs) {
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const file = join(dir, entry);
      if (statSync(file).isDirectory()) {
        walk(file);
        continue;
      }
      if (/\.(jar|png|ico)$/.test(entry) || entry === 'package-lock.json') continue;
      const before = readFileSync(file, 'utf8');
      const after = pairs.reduce((text, [from, to]) => text.split(from).join(to), before);
      if (after !== before) writeFileSync(file, after);
    }
  };
  walk(dest);
}

const goModule = moduleFlag ?? `github.com/your-org/${name}`;
replaceAll([
  ['github.com/your-org/gin-template', goModule],
  [templateDb, dbName],
  [`${kind}-template`, name],
]);

// package-lock.json carries the old package name at the top only.
const lock = join(dest, 'package-lock.json');
if (existsSync(lock)) {
  const data = JSON.parse(readFileSync(lock, 'utf8'));
  data.name = name;
  if (data.packages?.['']) data.packages[''].name = name;
  writeFileSync(lock, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`Created ${kind} project "${name}" at ${dest}\n`);
console.log('Next steps:');
console.log(`  cd ${target}`);
console.log('  ./scripts/setup.sh      # .env + 依赖');
console.log('  ./scripts/db.sh up      # 启动 PostgreSQL（并执行迁移）');
console.log('  ./scripts/dev.sh        # http://localhost:9000/api/health');
