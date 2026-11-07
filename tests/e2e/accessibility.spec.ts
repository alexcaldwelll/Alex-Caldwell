import { expect, test } from '@playwright/test';

test('keyboard navigation exposes focus and moves between Home and Blog', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.goto('/');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  const blog = page.getByRole('navigation').getByRole('link', { name: 'Blog' });
  await expect(blog).toBeFocused();
  expect(await blog.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  await page.screenshot({ path: '.superpowers/sdd/2026-11-06-alexandra-website/screenshots/task7-blog.png' });
});

test('reduced motion disables continuous scenes and all native transition animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
});

test('real HTML without JavaScript includes the story, index and valid reader', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole('heading', { level: 1, name: 'Alexandra’s story' })).toHaveCount(1);
  await expect(page.locator('.static-journey h2')).toHaveCount(5);
  await expect(page.locator('.chapter-poster')).toHaveCount(5);
  await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'A first note — sample post' }).click();
  await expect(page.getByRole('heading', { name: 'A first note — sample post' })).toBeVisible();
  await expect(page.locator('.markdown-content strong')).toHaveText('sample post');
  await context.close();
});
