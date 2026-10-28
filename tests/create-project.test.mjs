import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync,
  readFileSync, rmSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = process.env.SNK_TEST_SKILL ?? join(root, 'skills/snk-project');
function invoke(folder, target, frontend, backend, extra = []) {
  return spawnSync(process.execPath, [join(folder, 'scripts/create-project.mjs'),
    '--name', 'test-app', '--target', target, '--frontend', frontend, '--backend', backend, ...extra], { encoding: 'utf8', cwd: tmpdir() });
}
function temporary(t) {
  const dir = mkdtempSync(join(tmpdir(), 'snk-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('all eleven templates generate independently from a relocated skill', t => {
  const dir = temporary(t);
  const installed = join(dir, 'installed-skill');
  cpSync(skill, installed, { recursive: true });
  const pairs = [['react', 'express'], ['vue', 'nestjs'], ['next', 'django'],
    ['uniapp', 'gin'], ['rn', 'springboot'], ['flutter', 'express'], ['react', 'none'], ['none', 'gin']];
  for (const [frontend, backend] of pairs) {
    const target = join(dir, `project with spaces ${frontend}-${backend}`);
    const result = invoke(installed, target, frontend, backend, backend === 'gin' ? ['--module', 'github.com/me/test-api'] : []);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(join(target, 'web')), frontend !== 'none');
    assert.equal(existsSync(join(target, 'server')), backend !== 'none');
    assert.ok(existsSync(join(target, 'AGENTS.md')));
    const metadata = JSON.parse(readFileSync(join(target, 'snk-project.json'), 'utf8'));
    assert.equal(metadata.frontend, frontend);
    assert.equal(metadata.backend, backend);
    if (backend !== 'none') {
      for (const doc of ['API_CONTRACT.md', 'ARCHITECTURE.md', 'CONVENTIONS.md', 'TESTING.md']) {
        assert.ok(existsSync(join(target, 'server/docs', doc)), doc);
      }
      assert.ok(existsSync(join(target, 'server/scripts/contract-test.mjs')));
      assert.ok(lstatSync(join(target, 'server/scripts/setup.sh')).mode & 0o111);
      if (backend === 'gin') assert.match(readFileSync(join(target, 'server/go.mod'), 'utf8'), /module github.com\/me\/test-api/);
    }
    if (frontend !== 'none' && frontend !== 'flutter') {
      assert.equal(JSON.parse(readFileSync(join(target, 'web/package.json'), 'utf8')).name, 'test-app-web');
      assert.ok(existsSync(join(target, 'web/.env')));
      assert.doesNotMatch(readFileSync(join(target, 'web/src/core/README.md'), 'utf8'), /请勿修改/);
    }
    if (frontend === 'flutter') {
      assert.match(readFileSync(join(target, 'web/pubspec.yaml'), 'utf8'), /name: test_app_web/);
      assert.ok(existsSync(join(target, 'web/env/dev.json')));
    }
  }
});

test('rejects occupied directories, files and symlinks without changing their contents', t => {
  const dir = temporary(t);
  const occupied = join(dir, 'occupied');
  mkdirSync(occupied);
  writeFileSync(join(occupied, 'keep.txt'), 'original');
  const file = join(dir, 'file');
  writeFileSync(file, 'original');
  const link = join(dir, 'link');
  symlinkSync(occupied, link);
  for (const target of [occupied, file, link]) assert.notEqual(invoke(skill, target, 'react', 'express').status, 0);
  assert.equal(readFileSync(join(occupied, 'keep.txt'), 'utf8'), 'original');
  assert.equal(readFileSync(file, 'utf8'), 'original');
  const empty = join(dir, 'empty');
  mkdirSync(empty);
  assert.equal(invoke(skill, empty, 'react', 'none').status, 0);
});

test('invalid choices do not create a target and partial generation is rolled back', t => {
  const dir = temporary(t);
  const target = join(dir, 'new-project');
  for (const [front, back] of [['bogus', 'express'], ['react', 'bogus'], ['none', 'none']]) {
    assert.notEqual(invoke(skill, target, front, back).status, 0);
    assert.equal(existsSync(target), false);
  }
  assert.notEqual(invoke(skill, target, 'react', 'express', ['--force', 'yes']).status, 0);
  assert.equal(existsSync(target), false);
  const damaged = join(dir, 'damaged-skill');
  cpSync(skill, damaged, { recursive: true });
  rmSync(join(damaged, 'assets/backend/templates/express-template'), { recursive: true });
  assert.notEqual(invoke(damaged, target, 'react', 'express').status, 0);
  assert.equal(existsSync(target), false);
  assert.equal(readdirSync(dir).some(name => name.startsWith('.snk-project-')), false);
});

test('bundle contains examples but excludes local environments and generated artifacts', () => {
  const forbidden = new Set(['node_modules', '.env', '.venv', 'target', 'dist', '.git', 'logs', '.verify']);
  let examples = 0;
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      assert.ok(!forbidden.has(name), `Unexpected bundled ${join(dir, name)}`);
      assert.ok(!name.startsWith('.env.') || name === '.env.example');
      const path = join(dir, name);
      assert.ok(!lstatSync(path).isSymbolicLink());
      if (name === '.env.example') examples++;
      if (lstatSync(path).isDirectory()) walk(path);
    }
  }
  walk(join(skill, 'assets'));
  assert.equal(examples, 10); // 5 backend + 5 non-Flutter frontend.
});
