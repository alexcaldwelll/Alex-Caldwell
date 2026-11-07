/// <reference types="node" />
import { expect, test } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

let server: Server;
let origin: string;
let paths: string[];
test.beforeAll(async () => {
  paths = JSON.parse(await readFile('dist/prerender-paths.json', 'utf8'));
  server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url!, 'http://localhost').pathname;
      const file = resolve('dist', `.${path.includes('.') ? path : `${path.replace(/\/$/, '')}/index.html`}`);
      if (!file.startsWith(resolve('dist') + '/')) throw Error('Invalid path');
      const body = await readFile(file);
      response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' } as Record<string, string>)[extname(file)] ?? 'application/octet-stream');
      response.end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
test.afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });

test('production HTML contains every valid route with JavaScript disabled', async ({ browser }) => {
  expect(paths).toContain('/blog/first-note');
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const path of paths) {
    const response = await page.goto(`${origin}${path}`);
    expect(response!.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    if (path === '/') {
      await expect(page.locator('.static-journey h2')).toHaveCount(5);
      for (const image of await page.locator('.chapter-poster').all()) {
        await image.scrollIntoViewIfNeeded();
        expect(await image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }
    } else {
      expect(await page.locator('.blog-page').evaluate(element => getComputedStyle(element).overflowWrap)).toBe('anywhere');
      if (path.startsWith('/blog/')) await expect(page.locator('.markdown-content')).not.toBeEmpty();
    }
  }
  await context.close();
});

test('production hydration keeps initial content visible during lazy loading without errors or cinematic downloads', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => requests.push(request.url()));
  await page.route('**/assets/*.js', async route => { await new Promise(resolve => setTimeout(resolve, 250)); await route.continue(); });
  for (const path of paths) {
    await page.goto(`${origin}${path}`, { waitUntil: 'commit' });
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.getByRole('status')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  expect(requests.filter(url => /StoryExperience|three|gsap|lenis/.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});
