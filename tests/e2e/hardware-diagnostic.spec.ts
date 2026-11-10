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
    ["01-graphite", 0.108, "seattle"],
    ["02-seattle", 0.181, "seattle"],
    ["03-charleston-arrival", 0.205, "charleston"],
    ["04-charleston", 0.365, "charleston"],
    ["05-dc-fork", 0.485, "dc"],
    ["06-dc-faith", 0.59, "dc"],
    ["07-nashville", 0.775, "nashville"],
    ["08-future", 0.965, "future"],
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
test("the city artwork keeps the graphite on its visible edge and fits desktop framing", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  const metrics = [];
  const stops = [
    ["seattle", 0.108, 0.181],
    ["charleston", 0.315, 0.381],
    ["dc", 0.539, 0.59],
    ["nashville", 0.713, 0.783],
    ["future", 0.908, 0.966],
  ] as const;
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (const [chapter, during, complete] of stops) {
      const poster = await page.locator(`[aria-labelledby="chapter-${chapter}"] img`).getAttribute("src");
      // Revisit the drawing after completion to check the same scene when reversing.
      for (const progress of [during, complete, during]) {
        await atProgress(page, progress);
        const snapshot = await page.evaluate(async (chapter) => {
          const moduleURL = performance
            .getEntriesByType("resource")
            .find((entry) => entry.name.includes("/@react-three_fiber.js?"))!.name;
          const { _roots } = await import(moduleURL);
          const { scene, camera, gl } = _roots.get(document.querySelector("canvas")).store.getState();
          const artwork = scene.getObjectByName(`illustration-${chapter}`);
          const pencil = scene.getObjectByName("pencil-graphite-tip");
          const { width, height } = artwork.geometry.parameters;
          const { reveal, contactV } = artwork.material.uniforms;
          const worldPoint = (u: number, v: number) => artwork.localToWorld(
            artwork.position.clone().set((u - 0.5) * width, (v - 0.5) * height, 0),
          );
          // Each illustration has its own cream margins. Check the image area inside those margins.
          const corners = [[0.04, 0.04], [0.96, 0.04], [0.96, 0.96], [0.04, 0.96]]
            .map(([u, v]) => worldPoint(u, v).project(camera).toArray().slice(0, 2));
          const inFrame = (name: string) => {
            const motif = scene.getObjectByName(name);
            const point = motif.getWorldPosition(artwork.position.clone()).project(camera);
            return motif.visible && Math.abs(point.x) < 1 && Math.abs(point.y) < 1;
          };
          return {
            visible: artwork.visible,
            abandonedBall: inFrame("abandoned-soccer-ball"),
            faithLight: inFrame("faith-light"),
            reveal: reveal.value,
            artworkUrl: artwork.material.uniforms.illustration.value.image.src,
            tipError: worldPoint(reveal.value, contactV.value)
              .distanceTo(pencil.getWorldPosition(artwork.position.clone())),
            corners,
            triangles: gl.info.render.triangles,
            calls: gl.info.render.calls,
          };
        }, chapter);
        expect(snapshot.visible).toBe(true);
        expect(new URL(snapshot.artworkUrl).pathname).toBe(poster);
        for (const [x, y] of snapshot.corners) {
          expect(Math.abs(x)).toBeLessThan(1);
          expect(Math.abs(y)).toBeLessThan(1);
        }
        if (progress === during) {
          expect(snapshot.reveal).toBeGreaterThan(0.3);
          expect(snapshot.reveal).toBeLessThan(0.7);
          expect(snapshot.tipError).toBeLessThan(0.00001);
        } else {
          expect(snapshot.reveal).toBeGreaterThan(1);
          if (chapter === "dc") {
            expect(snapshot.abandonedBall).toBe(true);
            expect(snapshot.faithLight).toBe(true);
          }
        }
        expect(snapshot.triangles).toBeGreaterThan(2000);
        expect(snapshot.calls).toBeLessThan(250);
        metrics.push({ chapter, progress, viewport, ...snapshot });
      }
    }
  }
  await testInfo.attach("artwork-alignment-and-budgets", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
});
