// @vitest-environment node
/// <reference types="node" />
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'alexandra-assets-'));
  temporary.push(root);
  mkdirSync(join(root, 'src/assets'), { recursive: true });
  const png = Buffer.alloc(32);
  png.set([137, 80, 78, 71, 13, 10, 26, 10]);
  png.writeUInt32BE(1200, 16); png.writeUInt32BE(800, 20);
  writeFileSync(join(root, 'src/assets/poster.png'), png);
  writeFileSync(join(root, 'src/scene.ts'), "import poster from './assets/poster.png'; export { poster };");
  const asset = { path: 'src/assets/poster.png', origin: 'generated', source: 'Original fixture generation', license: 'Original artwork' };
  const manifest = { assets: [asset], scenes: [{ id: 'opening', files: [asset.path] }] };
  const save = () => writeFileSync(join(root, 'asset-policy.json'), JSON.stringify(manifest));
  save();
  return { root, manifest, save, png };
}
function check(root: string) {
  const result = spawnSync(process.execPath, [resolve('scripts/check-assets.mjs'), '--root', root, '--json'], { encoding: 'utf8' });
  return { status: result.status, output: result.stdout + result.stderr };
}
describe('asset release policy', () => {
  it('accepts credited local artwork and the real repository without inventing model downloads', () => {
    expect(check(fixture().root).status).toBe(0);
    expect(check(resolve('.')).status).toBe(0);
  });
  it('rejects missing source poster and GLB references even when absent from the manifest', () => {
    const { root } = fixture();
    writeFileSync(join(root, 'src/scene.ts'), "import poster from './assets/missing.webp'; const model = '/models/missing.glb';");
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.output).toContain('missing.webp');
    expect(result.output).toContain('missing.glb');
  });
  it('rejects unregistered assets and incomplete provenance', () => {
    const { root, manifest, save } = fixture();
    writeFileSync(join(root, 'src/assets/uncredited.glb'), 'glTF');
    manifest.assets[0].source = '';
    save();
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.output).toMatch(/uncredited.glb.*provenance/i);
    expect(result.output).toMatch(/poster.png.*provenance/i);
  });
  it('rejects oversized raster bytes, decoded pixel dimensions and geometry downloads', () => {
    const { root, manifest, save, png } = fixture();
    png.writeUInt32BE(8000, 16); png.writeUInt32BE(8000, 20);
    writeFileSync(join(root, 'src/assets/poster.png'), Buffer.concat([png, Buffer.alloc(210_000)]));
    const model = { ...manifest.assets[0], path: 'src/assets/scene.glb', origin: 'authored' };
    manifest.assets.push(model); manifest.scenes[0].files.push(model.path); save();
    writeFileSync(join(root, model.path), Buffer.alloc(1_100_000));
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.output).toMatch(/poster.png.*byte budget/i);
    expect(result.output).toMatch(/poster.png.*pixel budget/i);
    expect(result.output).toMatch(/scene.glb.*geometry budget/i);
    expect(result.output).toMatch(/opening.*scene budget/i);
  });
  it('rejects an added font without its redistributable license file', () => {
    const { root, manifest, save } = fixture();
    writeFileSync(join(root, 'src/assets/font.woff2'), Buffer.alloc(20));
    manifest.assets.push({ path: 'src/assets/font.woff2', origin: 'licensed', source: 'Example vendor', license: 'OFL' }); save();
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.output).toMatch(/font.woff2.*license file/i);
  });
  it('rejects missing blog covers, including quoted frontmatter paths', () => {
    const { root } = fixture();
    writeFileSync(join(root, 'src/post.md'), '---\ncoverImage: "/covers/absent.jpg"\n---\n![Missing](./assets/no.png)');
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.output).toContain('absent.jpg');
    expect(result.output).toContain('no.png');
  });
  it('fails closed on remote assets whose delivered size cannot be verified locally', () => {
    const { root, manifest, save } = fixture();
    const path = 'https://example.test/unbounded.webp';
    manifest.assets.push({ path, origin: 'generated', source: 'A credited remote image', license: 'Original artwork' }); save();
    writeFileSync(join(root, 'src/scene.ts'), `export const poster = '${path}';`);
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.output).toMatch(/remote asset.*local/i);
  });

});
