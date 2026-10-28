#!/usr/bin/env node
import {
  cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync,
  readFileSync, renameSync, rmdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const frontends = ['react', 'vue', 'next', 'uniapp', 'rn', 'flutter', 'none'];
const backends = ['express', 'nestjs', 'django', 'gin', 'springboot', 'none'];
const usage = 'node create-project.mjs --name my-app --target /path/my-app --frontend react --backend nestjs [--module github.com/owner/project]';
function fail(message) { throw new Error(message); }
function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(result.stderr || result.stdout || `Generator exited ${result.status}`);
}
function backendDocs(server) {
  // The upstream backend generator only copies API_CONTRACT.md; ship all developer docs.
  cpSync(join(skill, 'assets/backend/docs'), join(server, 'docs'), { recursive: true });
  cpSync(join(skill, 'assets/backend/scripts/contract-test.mjs'), join(server, 'scripts/contract-test.mjs'));
  for (const path of ['AGENTS.md', 'README.md', 'docs/TESTING.md']) {
    const file = join(server, path);
    if (!existsSync(file)) continue;
    const before = readFileSync(file, 'utf8');
    writeFileSync(file, before.replaceAll('npm run contract', 'node scripts/contract-test.mjs')
      .replaceAll('在模板仓库根目录运行', '在本项目 server 目录运行')
      .replaceAll('在仓库根目录运行', '在本项目 server 目录运行'));
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 1 && ['--help', '-h'].includes(argv[0])) {
    console.log(`${usage}\nFrontend: ${frontends.join(', ')}\nBackend: ${backends.join(', ')}`);
    return;
  }
  const options = {};
  const allowed = new Set(['name', 'target', 'frontend', 'backend', 'module']);
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].slice(2);
    if (!argv[i].startsWith('--') || !allowed.has(key)) fail(`Unknown option: ${argv[i]}`);
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) fail(`Missing value: ${argv[i]}`);
    if (key in options) fail(`Duplicate option: ${argv[i]}`);
    options[key] = argv[i + 1];
  }
  for (const key of ['name', 'target', 'frontend', 'backend']) {
    if (!options[key]) fail(`Missing --${key}. ${usage}`);
  }
  const { name, frontend, backend } = options;
  if (!/^[a-z][a-z0-9-]*$/.test(name)) fail('Project name must match ^[a-z][a-z0-9-]*$');
  if (!frontends.includes(frontend)) fail(`Unknown frontend: ${frontend}`);
  if (!backends.includes(backend)) fail(`Unknown backend: ${backend}`);
  if (frontend === 'none' && backend === 'none') fail('Choose at least one frontend or backend');
  if (options.module && backend !== 'gin') fail('--module is only supported for Gin');
  if (options.module && !/^[A-Za-z0-9][A-Za-z0-9._~/-]*$/.test(options.module)) fail('Invalid Go module path');

  const target = resolve(options.target);
  if (existsSync(target)) {
    if (lstatSync(target).isSymbolicLink() || !lstatSync(target).isDirectory()) fail('Target must be a directory, not a file or symlink');
    if (readdirSync(target).length) fail(`Target is not empty: ${target}`);
  }
  const manifest = JSON.parse(readFileSync(join(skill, 'assets/manifest.json'), 'utf8'));
  mkdirSync(dirname(target), { recursive: true });
  const staging = mkdtempSync(join(dirname(target), '.snk-project-'));
  try {
    if (frontend !== 'none') run(join(skill, 'assets/frontend/scripts/create-app.mjs'), [frontend, join(staging, 'web'), '--name', `${name}-web`]);
    if (backend !== 'none') {
      const args = [backend, join(staging, 'server'), '--name', `${name}-server`];
      if (options.module) args.push('--module', options.module);
      run(join(skill, 'assets/backend/scripts/create-app.mjs'), args);
      backendDocs(join(staging, 'server'));
    }
    const commands = [];
    if (backend !== 'none') commands.push('cd server\n./scripts/setup.sh\n./scripts/db.sh up\n./scripts/dev.sh');
    if (frontend !== 'none') {
      const start = { react: 'npm run dev', vue: 'npm run dev', next: 'npm run dev', uniapp: 'npm run dev:h5', rn: 'npm run start' };
      commands.push(frontend === 'flutter'
        ? 'cd web\n./tool/setup_platforms.sh <组织标识>\nflutter run --dart-define-from-file=env/dev.json'
        : `cd web\nnpm install\n${backend === 'none' ? '# 另开终端：npm run mock\n' : ''}${start[frontend]}`);
    }
    const readme = `# ${name}\n\n前端：${frontend}；后端：${backend}。由 SNK Project ${manifest.version} 创建。\n\n## 开发\n\n以下各组命令分别从项目根目录开始，在不同终端执行：\n\n${commands.map(c => `\`\`\`bash\n${c}\n\`\`\``).join('\n\n')}\n\n默认 API：http://localhost:9000/api/v1。${backend !== 'none' ? '前端连接真实后端，不需要启动 Mock。后端需要 PostgreSQL / Docker。' : '可以使用前端内置 Mock。'}\n\nApp 的 Android 模拟器使用 10.0.2.2，真机使用电脑局域网 IP，修改前端环境配置。\n\n详细说明和检查命令见各端 README.md、AGENTS.md 和 docs/。\n${backend !== 'none' ? '\n服务启动后，在项目根目录运行 `node server/scripts/contract-test.mjs` 验证契约（本地开发需开启演示账号）。接口契约位于 `server/docs/API_CONTRACT.md`。\n' : ''}`;
    writeFileSync(join(staging, 'README.md'), readme);
    writeFileSync(join(staging, 'AGENTS.md'), `# ${name}\n\n修改前先读本文件，再读所修改端的 AGENTS.md、README.md 和相关 docs/。\n\n${frontend !== 'none' ? '- 前端位于 web/；遵循 features 分层、状态边界、i18n 和主题约定。生成后的 core 归本项目所有。\n' : ''}${backend !== 'none' ? '- 后端位于 server/；遵循 controller/service/repository 分层。接口契约以 server/docs/API_CONTRACT.md 为准。契约变更同步前端和 server/scripts/contract-test.mjs。\n' : ''}- 只修改本项目，不需要修改或同步其他技术栈模板。\n- 按对应端说明运行检查；缺少工具链时说明未验证范围。\n`);
    writeFileSync(join(staging, 'CLAUDE.md'), '@AGENTS.md\n');
    writeFileSync(join(staging, '.nvmrc'), '22\n');
    writeFileSync(join(staging, '.gitignore'), '**/node_modules/\n**/.env\n**/.env.*\n!**/.env.example\n**/env/dev.json\n**/.DS_Store\n');
    writeFileSync(join(staging, 'snk-project.json'), `${JSON.stringify({ name, frontend, backend, template: manifest, ...(options.module ? { goModule: options.module } : {}) }, null, 2)}\n`);
    if (existsSync(target)) rmdirSync(target); // Only an empty directory can be removed.
    renameSync(staging, target);
    console.log(`Created ${target}\nFrontend: ${frontend}\nBackend: ${backend}\nSee ${join(target, 'README.md')} for setup commands. Dependencies are not installed yet.`);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}
try { main(); } catch (error) { console.error(`SNK Project: ${error.message}`); process.exitCode = 1; }
