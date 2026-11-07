/// <reference types="node" />
import { expect, test } from '@playwright/test';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { build, createServer as createViteServer, type ViteDevServer } from 'vite';

const literal = "Literal $& $$ $` $' sequences";
let directory: string;
let development: ViteDevServer;
let production: Server;
const origins: Record<string, string> = {};

test.beforeAll(async () => {
  // Build isolated authored input; the real post collection and root devserver stay untouched.
  directory = await mkdtemp(join(tmpdir(), 'alexandra-literal-post-'));
  for (const path of ['src', 'scripts', 'vite.config.ts', 'index.html', 'package.json']) {
    await cp(resolve(path), join(directory, path), { recursive: true });
  }
  await symlink(resolve('node_modules'), join(directory, 'node_modules'), 'dir');
  const index = join(directory, 'index.html');
  await writeFile(index, (await readFile(index, 'utf8')).replace('</head>', '<link rel="icon" href="data:,"></head>'));
  await writeFile(join(directory, 'src/content/posts/literal-sequences.md'), `---\ntitle: ${JSON.stringify(literal)}\ndate: 2026-11-06\nexcerpt: ${JSON.stringify(literal)}\n---\n${literal}\n`);
  await build({ root: directory, logLevel: 'silent' });
  await promisify(execFile)(process.execPath, ['scripts/prerender.mjs'], { cwd: directory });
  development = await createViteServer({ root: directory, cacheDir: join(directory, '.vite-cache'), logLevel: 'silent', server: { host: '127.0.0.1', port: 0, hmr: false } });
  await development.listen();
  origins.development = `http://127.0.0.1:${(development.httpServer!.address() as { port: number }).port}`;
  production = createServer(async (request, response) => {
    try {
      const path = new URL(request.url!, 'http://localhost').pathname;
      const file = join(directory, 'dist', path.includes('.') ? path : `${path}/index.html`);
      const body = await readFile(file);
      response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' } as Record<string, string>)[extname(file)] ?? 'application/octet-stream');
      response.end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>(resolve => production.listen(0, '127.0.0.1', resolve));
  origins.production = `http://127.0.0.1:${(production.address() as { port: number }).port}`;
});

test.afterAll(async () => {
  await development?.close();
  if (production) await new Promise<void>(resolve => production.close(() => resolve()));
  if (directory) await rm(directory, { recursive: true, force: true });
});

for (const mode of ['development', 'production']) {
  test(`${mode} preserves replacement-token text in initial HTML and hydration`, async ({ browser }) => {
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(`${message.text()} ${message.location().url}`); });
      await page.goto(`${origins[mode]}/blog/literal-sequences`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#root')).toHaveCount(1);
      await expect(page.locator('.app-shell')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(literal);
      await expect(page.locator('.blog-excerpt')).toHaveText(literal);
      await expect(page.locator('.markdown-content p')).toHaveText(literal);
      const moduleSources = await page.locator('script[type="module"][src]').evaluateAll(scripts => scripts.map(script => script.getAttribute('src')));
      expect(new Set(moduleSources).size).toBe(moduleSources.length);
      expect(errors).toEqual([]);
      await context.close();
    }
  });
}
