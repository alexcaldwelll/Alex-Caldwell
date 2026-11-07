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
    ["03-plane", 0.205, "charleston"],
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
test("completed chapter overviews show real landmark geometry and report renderer budgets", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  const metrics = [];
  for (const [chapter, p, ids] of [
    ["seattle", 0.19, ["seattle-needle", "seattle-lake", "seattle-rainier"]],
    [
      "charleston",
      0.392,
      ["charleston-coast", "charleston-travel", "florida-tournament"],
    ],
    ["dc", 0.597, ["dc-gw", "dc-retirement", "dc-patrick"]],
    [
      "nashville",
      0.802,
      ["nashville-vanderbilt", "nashville-joy", "nashville-immaculate"],
    ],
  ] as const) {
    await atProgress(page, p);
    const snapshot = await page.evaluate(async (ids) => {
      // Inspect the renderer that produced this canvas, not a substitute test scene.
      const moduleURL = performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/@react-three_fiber.js?"))!.name;
      const { _roots } = await import(moduleURL);
      const state = _roots
        .get(document.querySelector("canvas"))
        .store.getState();
      const threeURL = performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/three.js?"))!.name;
      const { Box3, Vector3 } = await import(threeURL);
      const landmarks = ids.map((id) => {
        const object = state.scene.getObjectByName(id);
        const box = new Box3().setFromObject(object);
        const center = box.getCenter(new Vector3()).project(state.camera);
        return {
          id,
          visible: object.visible,
          center: [center.x, center.y],
          volume: object.children[1].scale.y,
        };
      });
      return {
        calls: state.gl.info.render.calls,
        triangles: state.gl.info.render.triangles,
        textures: state.gl.info.memory.textures,
        geometries: state.gl.info.memory.geometries,
        landmarks,
      };
    }, ids);
    for (const landmark of snapshot.landmarks) {
      expect(landmark.visible).toBe(true);
      expect(landmark.volume).toBe(1);
      expect(Math.abs(landmark.center[0])).toBeLessThan(0.9);
      expect(Math.abs(landmark.center[1])).toBeLessThan(0.9);
    }
    expect(snapshot.triangles).toBeGreaterThan(2000);
    expect(snapshot.calls).toBeLessThan(250);
    metrics.push({ chapter, ...snapshot });
    await page.screenshot({ path: `${screenshots}/overview-${chapter}.png` });
  }
  console.log(
    "Measured renderer budgets including shadows",
    JSON.stringify(metrics),
  );
  await testInfo.attach("scene-budgets", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
});
