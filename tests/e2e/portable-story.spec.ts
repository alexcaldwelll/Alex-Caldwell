import { expect, test } from '@playwright/test';
import { atProgress, canvasPixels } from './story-helpers';

type Frame = { calls: number; triangles: number };
declare global { interface Window { storyFrames: Frame[] } }

test('portable software WebGL draws actual pencil and chapter pixels within total-pass budgets', async ({ page }, testInfo) => {
  // Observe public WebGL calls on the actual site canvas. No private R3F imports,
  // substitute scene, screenshot of a poster, or fallback-as-success branch.
  await page.addInitScript(() => {
    window.storyFrames = [];
    let calls = 0, triangles = 0;
    const count = (mode: number, vertices: number, instances = 1) => {
      calls++;
      if (mode === 4) triangles += vertices / 3 * instances;
      else if (mode === 5 || mode === 6) triangles += Math.max(0, vertices - 2) * instances;
    };
    const proto = WebGL2RenderingContext.prototype;
    const elements = proto.drawElements, arrays = proto.drawArrays;
    const instancedElements = proto.drawElementsInstanced, instancedArrays = proto.drawArraysInstanced;
    proto.drawElements = function (mode, vertices, type, offset) { count(mode, vertices); return elements.call(this, mode, vertices, type, offset); };
    proto.drawArrays = function (mode, first, vertices) { count(mode, vertices); return arrays.call(this, mode, first, vertices); };
    proto.drawElementsInstanced = function (mode, vertices, type, offset, instances) { count(mode, vertices, instances); return instancedElements.call(this, mode, vertices, type, offset, instances); };
    proto.drawArraysInstanced = function (mode, first, vertices, instances) { count(mode, vertices, instances); return instancedArrays.call(this, mode, first, vertices, instances); };
    const sample = () => {
      if (calls) { window.storyFrames.push({ calls, triangles }); if (window.storyFrames.length > 120) window.storyFrames.shift(); }
      calls = 0; triangles = 0;
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.desktop-canvas canvas')).toBeVisible();
  const renderer = await page.locator('canvas').evaluate(canvas => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2')!;
    const extension = gl.getExtension('WEBGL_debug_renderer_info');
    return extension ? String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  });
  await expect.poll(async () => (await canvasPixels(page)).yellow).toBeGreaterThan(9000);
  const metrics = [];
  for (const [chapter, progress] of [['seattle', 0.19], ['charleston', 0.392], ['dc', 0.597], ['nashville', 0.795], ['future', 0.93]] as const) {
    await atProgress(page, progress);
    await expect(page.locator('.cinematic-journey')).toHaveAttribute('data-chapter', chapter);
    await page.evaluate(() => { window.storyFrames = []; });
    await expect.poll(() => page.evaluate(() => window.storyFrames.length)).toBeGreaterThan(2);
    const pixels = await canvasPixels(page);
    expect(pixels.dark + pixels.green + pixels.blue).toBeGreaterThan(500);
    if (chapter === 'seattle' || chapter === 'nashville') expect(pixels.green).toBeGreaterThan(200);
    const frames = await page.evaluate(() => window.storyFrames);
    const calls = Math.max(...frames.map(frame => frame.calls));
    const triangles = Math.max(...frames.map(frame => frame.triangles));
    expect(calls).toBeLessThanOrEqual(250);
    expect(triangles).toBeLessThanOrEqual(100_000);
    expect(triangles).toBeGreaterThan(2000);
    metrics.push({ chapter, callsIncludingShadows: calls, trianglesIncludingShadows: triangles, pixels });
  }
  await atProgress(page, 0);
  expect((await canvasPixels(page)).green).toBeLessThan(1000);
  expect(errors).toEqual([]);
  const evidence = { mode: 'portable functional software-WebGL, not a hardware performance benchmark', renderer, metrics };
  console.log(JSON.stringify(evidence));
  await testInfo.attach('portable-webgl', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
});
