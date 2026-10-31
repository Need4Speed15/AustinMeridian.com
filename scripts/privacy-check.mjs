import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

// Check public source/output; private local records are deliberately outside these roots.
const root = resolve(import.meta.dirname, '..');
const paths = ['src', 'public', 'dist', 'scripts', '.github', 'docs', 'README.md', 'package.json', 'release-review.json', 'Preview Website.cmd'];
async function filesAt(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    const groups = await Promise.all(entries.map(entry => entry.isDirectory()
      ? filesAt(resolve(path, entry.name)) : [resolve(path, entry.name)]));
    return groups.flat();
  } catch (error) {
    if (error.code === 'ENOTDIR') return [path];
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}
const files = (await Promise.all(paths.map(path => filesAt(resolve(root, path))))).flat();
const patterns = [
  ['absolute private workstation path', /\b[A-Za-z]:[\\/](?:Users|zOther|Camera Roll)[\\/]|\/(?:Users|home)\/[^/\s]+/i],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['access token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|(?:AKIA|ASIA)[A-Z0-9]{16})\b/],
  ['embedded signed token', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/]
];
for (const path of files) {
  const name = relative(root, path).replaceAll('\\', '/');
  assert(!/(?:^|\/)\.env(?:\.|$)|\.(?:apk|jks|keystore|pem|p12|pfx)$|google-services\.json|service.account/i.test(name), `Private file in public source: ${name}`);
  if (!/\.(?:md|txt|json|js|mjs|css|html|csv|yml|yaml|cmd|svg)$/.test(name)) continue;
  const text = await readFile(path, 'utf8');
  for (const [kind, expression] of patterns) {
    assert(!expression.test(text), `Potential ${kind} in ${name}; inspect locally without printing its value.`);
  }
}
console.log('PASS: public-source privacy checks (private paths, file types and credential patterns).');
