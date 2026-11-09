import { expect, test } from "@playwright/test";
import { atProgress, canvasPixels } from "./story-helpers";
const screenshots = ".superpowers/sdd/2026-11-06-alexandra-website/screenshots";
test("hardware desktop renders the pencil and ordered continuous 3D chapters", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".desktop-canvas canvas")).toBeVisible();
  const gpu = await page.locator("canvas").evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2")!;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext
      ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
  });
  console.log("Actual renderer:", gpu);
  await testInfo.attach("renderer", {
    body: String(gpu),
    contentType: "text/plain",
  });
  expect(gpu).not.toMatch(/swiftshader|llvmpipe/i);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshots}/00-opening.png` });
  const opening = await canvasPixels(page);
  expect(opening.yellow).toBeGreaterThan(9000);
  expect(opening.green).toBeLessThan(1000);
  for (const [name, p, chapter] of [
    ["01-graphite", 0.05, "seattle"],
    ["02-seattle", 0.165, "seattle"],
    ["03-charleston-arrival", 0.205, "charleston"],
    ["04-charleston", 0.365, "charleston"],
    ["05-dc-fork", 0.51, "dc"],
    ["06-dc-faith", 0.57, "dc"],
    ["07-nashville", 0.775, "nashville"],
    ["08-future", 0.93, "future"],
  ] as const) {
    await atProgress(page, p);
    expect(
      await page.locator(".cinematic-journey").getAttribute("data-chapter"),
    ).toBe(chapter);
    await page.screenshot({ path: `${screenshots}/${name}.png` });
    const pixels = await canvasPixels(page);
    console.log(name, pixels);
    expect(pixels.dark + pixels.green + pixels.blue).toBeGreaterThan(
      name === "01-graphite" ? 200 : 500,
    );
    if (name === "02-seattle" || name === "07-nashville")
      expect(pixels.green).toBeGreaterThan(200);
  }
  await atProgress(page, 0);
  expect((await canvasPixels(page)).green).toBeLessThan(1000);
  expect(errors).toEqual([]);
});
test("the same mobile illustrations render as world-space meshes beside the pencil", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  const metrics = [];
  for (const [chapter, progress] of [
    ["seattle", 0.19],
    ["charleston", 0.392],
    ["dc", 0.592],
    ["nashville", 0.795],
  ] as const) {
    await atProgress(page, progress);
    const poster = await page.locator(`[aria-labelledby="chapter-${chapter}"] img`).getAttribute("src");
    const snapshot = await page.evaluate(async (chapter) => {
      const moduleURL = performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/@react-three_fiber.js?"))!.name;
      const { _roots } = await import(moduleURL);
      const { scene, camera, gl } = _roots.get(document.querySelector("canvas")).store.getState();
      const artwork = scene.getObjectByName(`illustration-${chapter}`);
      const center = artwork.position.clone().project(camera);
      return {
        visible: artwork.visible,
        reveal: artwork.material.uniforms.reveal.value,
        artworkUrl: artwork.material.uniforms.illustration.value.image.src,
        center: [center.x, center.y],
        triangles: gl.info.render.triangles,
        calls: gl.info.render.calls,
      };
    }, chapter);
    expect(snapshot.visible).toBe(true);
    expect(snapshot.reveal).toBeGreaterThan(1);
    expect(new URL(snapshot.artworkUrl).pathname).toBe(poster);
    expect(Math.abs(snapshot.center[0])).toBeLessThan(0.85);
    expect(Math.abs(snapshot.center[1])).toBeLessThan(0.85);
    expect(snapshot.triangles).toBeGreaterThan(2000);
    expect(snapshot.calls).toBeLessThan(250);
    metrics.push({ chapter, ...snapshot });
    await page.screenshot({ path: `${screenshots}/overview-${chapter}.png` });
  }
  await testInfo.attach("scene-budgets", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
});
