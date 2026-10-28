#!/usr/bin/env node
// From this repository's maintained templates to a self-contained installable skill.
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = {
  frontend: resolve(root, 'frontend'),
  backend: resolve(root, 'backend'),
};
const assets = join(root, 'skills/snk-project/assets');
const skip = new Set([
  '.git', 'node_modules', 'dist', 'build', 'target', 'bin', 'logs', '.venv',
  '__pycache__', '.pytest_cache', '.ruff_cache', 'coverage', '.verify', '.next',
  'out', '.expo', 'unpackage', '.dart_tool', '.turbo', '.DS_Store',
  'next-env.d.ts', 'expo-env.d.ts', 'db.sqlite3',
]);
function include(path) {
  const name = basename(path);
  return !skip.has(name) && !lstatSync(path).isSymbolicLink()
    && !(name === '.env' || (name.startsWith('.env.') && name !== '.env.example'))
    && !/\.(log|tsbuildinfo|pyc|pem|key)$/.test(name)
    && !path.endsWith('/env/dev.json');
}
for (const source of Object.values(sources)) {
  for (const required of ['templates', 'docs', 'scripts/create-app.mjs']) {
    if (!existsSync(join(source, required))) throw new Error(`Missing template source: ${join(source, required)}`);
  }
}
mkdirSync(assets, { recursive: true });
for (const [kind, source] of Object.entries(sources)) {
  const dest = join(assets, kind);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(join(dest, 'scripts'), { recursive: true });
  for (const dir of ['templates', 'docs']) {
    cpSync(join(source, dir), join(dest, dir), { recursive: true, filter: include });
  }
  const scripts = kind === 'frontend' ? ['create-app.mjs', 'mock-server.mjs'] : ['create-app.mjs', 'contract-test.mjs'];
  for (const script of scripts) cpSync(join(source, 'scripts', script), join(dest, 'scripts', script));
}

// A content version stays stable when bundling unchanged template sources.
const hash = createHash('sha256');
let files = 0;
let bytes = 0;
function digest(dir) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (lstatSync(path).isDirectory()) digest(path);
    else {
      const data = readFileSync(path);
      hash.update(`${relative(assets, path)}\0`).update(data).update('\0');
      files++;
      bytes += data.length;
    }
  }
}
digest(join(assets, 'frontend'));
digest(join(assets, 'backend'));
const manifest = { schemaVersion: 1, version: '1.0.0', sha256: hash.digest('hex'), files, bytes };
writeFileSync(join(assets, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Bundled ${files} template files (${(bytes / 1024 / 1024).toFixed(2)} MiB), sha256 ${manifest.sha256}`);
