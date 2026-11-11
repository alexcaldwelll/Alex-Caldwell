import { expect, test } from '@playwright/test';

test('390px Home has an accessible static journey without cinematic imports', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const resources: string[] = [];
  page.on('request', request => resources.push(request.url()));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Alexandra’s story' })).toHaveCount(1);
  await expect(page.locator('.static-journey')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(resources.filter(url => /StoryExperience|StoryCanvas|three\.js|gsap|lenis/.test(url))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const poster of await page.locator('.chapter-poster').all()) {
    await poster.scrollIntoViewIfNeeded();
    await expect.poll(() => poster.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '.superpowers/sdd/2026-11-06-alexandra-website/screenshots/task7-mobile.png', fullPage: true });
});

test('narrow reader contains real long unbroken title, tag, link and code content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/blog/first-note');
  // Mutate only after the real lazy reader has hydrated.
  await page.waitForLoadState('networkidle');
  await page.locator('.blog-reader').evaluate(element => {
    element.querySelector('h1')!.textContent = 'LongUnbrokenTitle'.repeat(35);
    element.querySelector('.blog-excerpt')!.textContent = 'LongUnbrokenExcerpt'.repeat(80);
    const tag = document.createElement('li');
    tag.textContent = 'UnbrokenTag'.repeat(50);
    element.querySelector('.blog-tags')!.append(tag);
    const body = element.querySelector('.markdown-content')!;
    body.innerHTML += `<p><a href="#">${'UnbrokenLink'.repeat(100)}</a></p><pre><code>${'UnbrokenCode'.repeat(200)}</code></pre>`;
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const pre = page.locator('pre');
  expect(await pre.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.screenshot({ path: '.superpowers/sdd/2026-11-06-alexandra-website/screenshots/task7-long-content.png' });
});

test('desktop remains eligible for the cinematic canvas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.road-stage canvas')).toBeVisible();
});
