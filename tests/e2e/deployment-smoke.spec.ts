import { expect, test } from '@playwright/test';

const deploymentUrl = process.env.DEPLOYMENT_URL;

test('deployed Home, Blog and a post load directly with JavaScript disabled', async ({ browser }) => {
  test.skip(!deploymentUrl, 'Set DEPLOYMENT_URL to a reachable deployment to verify hosted routes.');

  const base = new URL(deploymentUrl!);
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    const open = async (path: string) => {
      const response = await page.goto(new URL(path, base).href);
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).origin).toBe(base.origin);
    };

    await open('./');
    await expect(page.locator('.story-opening img')).toBeVisible();
    await expect.poll(() => page.locator('.story-opening img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('.static-journey h2')).toHaveCount(5);
    await expect(page.locator('canvas')).toHaveCount(0);

    await open('blog');
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
    const postLink = page.locator(`main a[href^="${base.pathname}blog/"]`).first();
    const postPath = await postLink.getAttribute('href');
    expect(postPath?.slice(base.pathname.length)).toMatch(/^blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/);

    await open(postPath!);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.markdown-content')).not.toBeEmpty();
  } finally {
    await context.close();
  }
});
