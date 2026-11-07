// @vitest-environment node
/// <reference types="node" />
import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const roots: string[] = [];
afterEach(() => roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })));
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'alexandra-bundles-')); roots.push(root);
  mkdirSync(join(root, '.vite')); mkdirSync(join(root, 'assets'));
  const manifest = {
    'index.html': { file: 'assets/main.js', imports: [] as string[] },
    'src/scenes/desktop/StoryExperience.tsx': { file: 'assets/scene.js', imports: ['index.html', 'vendor'] },
    'src/routes/BlogPage.tsx': { file: 'assets/blog.js', imports: ['index.html'] },
    'src/routes/BlogPostPage.tsx': { file: 'assets/post.js', imports: ['index.html'] },
    vendor: { file: 'assets/vendor.js', imports: [] as string[] },
  };
  for (const { file } of Object.values(manifest)) writeFileSync(join(root, file), 'export const small = 1;');
  const save = () => writeFileSync(join(root, '.vite/manifest.json'), JSON.stringify(manifest));
  save();
  return { root, manifest, save };
}
function check(root: string) { const result = spawnSync(process.execPath, [resolve('scripts/check-bundles.mjs'), '--dist', root], { encoding: 'utf8' }); return { status: result.status, output: result.stdout + result.stderr }; }
it('counts static dependencies of the desktop entry, not just its own file', () => {
  const { root } = fixture();
  expect(check(root).status).toBe(0);
  writeFileSync(join(root, 'assets/vendor.js'), `export default "${randomBytes(340_000).toString('hex')}";`);
  const result = check(root);
  expect(result.status).toBe(1);
  expect(result.output).toContain('desktopIncremental gzip budget exceeded');
});
it('rejects a scene dependency moved into the initial route group', () => {
  const { root, manifest, save } = fixture();
  manifest['index.html'].imports.push('src/scenes/desktop/StoryExperience.tsx');
  manifest['src/scenes/desktop/StoryExperience.tsx'].file = 'assets/StoryExperience.js';
  writeFileSync(join(root, 'assets/StoryExperience.js'), 'export default 1;'); save();
  expect(check(root).output).toContain('Desktop scene leaked');
  expect(check(root).status).toBe(1);
});
it('fails closed if the production manifest or required route chunk is missing', () => {
  const { root } = fixture();
  rmSync(join(root, 'assets/post.js'));
  expect(check(root).status).toBe(1);
});
