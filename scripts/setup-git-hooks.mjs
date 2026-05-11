import { chmodSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const hooksPath = resolve(repoRoot, '.githooks');
const preCommitHook = resolve(hooksPath, 'pre-commit');

if (!existsSync(hooksPath)) {
  throw new Error(`Missing hooks directory: ${hooksPath}`);
}

if (!existsSync(preCommitHook)) {
  throw new Error(`Missing pre-commit hook: ${preCommitHook}`);
}

execFileSync('git', ['config', '--local', 'core.hooksPath', '.githooks'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

chmodSync(preCommitHook, 0o755);

console.log('Configured local git hooks at .githooks');
