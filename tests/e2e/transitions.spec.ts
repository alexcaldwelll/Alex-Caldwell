import { expect, test } from '@playwright/test';

test('native transitions preserve the shared post title and keep lateral navigation still', async ({ page }) => {
  await page.addInitScript(() => {
    const original = document.startViewTransition.bind(document);
    (window as unknown as { transitionFrames: unknown[] }).transitionFrames = [];
    (window as unknown as { pendingTransitions: number }).pendingTransitions = 0;
    document.startViewTransition = ((...args: Parameters<typeof original>) => {
      (window as unknown as { pendingTransitions: number }).pendingTransitions++;
      const transition = original(...args);
      transition.finished.finally(() => { (window as unknown as { pendingTransitions: number }).pendingTransitions--; }).catch(() => {});
      transition.ready.then(() => {
        (window as unknown as { transitionFrames: unknown[] }).transitionFrames.push(document.getAnimations().map(animation => {
          const effect = animation.effect as KeyframeEffect;
          return { target: effect.pseudoElement, frames: effect.getKeyframes() };
        }));
      }).catch(() => {});
      return transition;
    }) as typeof document.startViewTransition;
  });
  await page.goto('/blog', { waitUntil: 'networkidle' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  // Warm the lazy reader through a real visit; paired content must be ready together.
  await page.getByRole('link', { name: 'A first note — sample post' }).click();
  await expect(page.getByRole('heading', { name: 'A first note — sample post', exact: true, level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Blog' }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await expect.poll(() => page.evaluate(() => (window as unknown as { pendingTransitions: number }).pendingTransitions)).toBe(0);
  await page.evaluate(() => (window as unknown as { transitionFrames: unknown[] }).transitionFrames = []);
  await page.getByRole('link', { name: 'A first note — sample post' }).click();
  await expect.poll(() => page.evaluate(() => JSON.stringify((window as unknown as { transitionFrames: unknown[] }).transitionFrames))).toContain('post-first-note-title');
  await expect.poll(() => page.evaluate(() => (window as unknown as { pendingTransitions: number }).pendingTransitions)).toBe(0);
  await page.evaluate(() => (window as unknown as { transitionFrames: unknown[] }).transitionFrames = []);
  await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();
  await expect(page.locator('.story-opening')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { transitionFrames: unknown[] }).transitionFrames.length)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => (window as unknown as { pendingTransitions: number }).pendingTransitions)).toBe(0);
  const lateral = await page.evaluate(() => (window as unknown as { transitionFrames: { target: string; frames: Record<string, unknown>[] }[][] }).transitionFrames);
  for (const animation of lateral.flat()) {
    // A static snapshot matrix is harmless; a changing transform would imply a slide.
    const transforms = animation.frames.map(frame => frame.transform).filter(value => typeof value === 'string');
    expect(new Set(transforms).size, JSON.stringify(animation)).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test('an actually suspended Blog route reveals content and unsupported browsers still navigate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/src/routes/BlogPage.tsx*', async route => {
    await held;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();
  await expect(page.getByRole('status')).toHaveText('Loading notes…');
  release();
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.addInitScript(() => Object.defineProperty(document, 'startViewTransition', { value: undefined }));
  await page.goto('/blog');
  await page.getByRole('link', { name: 'A first note — sample post' }).click();
  await expect(page.getByRole('heading', { name: 'A first note — sample post' })).toBeVisible();
});
