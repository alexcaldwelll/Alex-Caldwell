import { expect, test, type Page } from "@playwright/test";
const screenshots = ".superpowers/sdd/2026-11-06-alexandra-website/screenshots";
async function atProgress(page: Page, progress: number) {
  await page.locator(".cinematic-journey").evaluate((element, p) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo(
      0,
      window.scrollY + rect.top + (rect.height - window.innerHeight) * p,
    );
  }, progress);
  await expect
    .poll(async () =>
      Number(
        await page.locator(".cinematic-journey").getAttribute("data-progress"),
      ),
    )
    .toBeCloseTo(progress, 2);
  await page.waitForTimeout(250);
}
async function canvasPixels(page: Page) {
  const png = await page.locator(".desktop-canvas canvas").screenshot();
  return page.evaluate(async (base64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let yellow = 0,
      green = 0,
      blue = 0,
      dark = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
      if (r > 135 && g > 90 && r > g * 1.07 && g > b * 1.4) yellow++;
      if (g > r * 1.05 && g > b * 1.03) green++;
      if (b > r * 1.05 && g > r * 1.05) blue++;
      if (r < 140 && g < 140 && b < 140) dark++;
    }
    return { yellow, green, blue, dark };
  }, png.toString("base64"));
}
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
test("context loss restores the complete static journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page
    .locator("canvas")
    .evaluate((canvas) =>
      (canvas as HTMLCanvasElement)
        .getContext("webgl2")!
        .getExtension("WEBGL_lose_context")!
        .loseContext(),
    );
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".cinematic-journey")).toHaveCount(0);
  await expect(page.locator(".static-journey")).toBeVisible();
  await expect(
    page.getByRole("img", { name: /oversized yellow pencil/i }),
  ).toBeVisible();
});
for (const mode of ["reduced", "mobile"] as const)
  test(`${mode} bypasses the scene and scrolling imports`, async ({ page }) => {
    if (mode === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    else await page.setViewportSize({ width: 390, height: 844 });
    const requested: string[] = [];
    page.on("request", (r) => requested.push(r.url()));
    await page.goto("/");
    await expect(page.locator(".static-journey")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(
      requested.filter((url) =>
        /StoryExperience|StoryCanvas|three\.js|gsap|lenis/.test(url),
      ),
    ).toEqual([]);
    expect(await page.locator(".static-journey h2").allTextContents()).toEqual([
      "Seattle",
      "Charleston",
      "Washington, DC",
      "Nashville",
      "The unfinished future",
    ]);
  });
test("initialization failure preserves fallback and navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      if (String(type).includes("webgl")) return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".cinematic-journey")).toHaveCount(0);
  await expect(page.locator(".static-journey")).toBeVisible();
  await page.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
});
test("actual WebGL draw calls stop offscreen/hidden and cleanly resume", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.drawElements;
    (window as unknown as { storyDraws: number }).storyDraws = 0;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      (window as unknown as { storyDraws: number }).storyDraws++;
      return original.apply(this, args);
    };
  });
  const draws = () =>
    page.evaluate(
      () => (window as unknown as { storyDraws: number }).storyDraws,
    );
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(400);
  expect(await draws()).toBeGreaterThan(10);
  await page
    .locator(".story-stage")
    .evaluate(
      (element) => ((element as HTMLElement).style.visibility = "hidden"),
    );
  // IntersectionObserver observes geometry, so remove the stage from layout for offscreen coverage.
  await page
    .locator(".story-stage")
    .evaluate((element) => ((element as HTMLElement).style.display = "none"));
  await page.waitForTimeout(200);
  const stopped = await draws();
  await page.waitForTimeout(200);
  expect(await draws()).toBe(stopped);
  await page.locator(".story-stage").evaluate((element) => {
    (element as HTMLElement).style.display = "";
    (element as HTMLElement).style.visibility = "";
  });
  await expect.poll(draws).toBeGreaterThan(stopped);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(100);
  const hidden = await draws();
  await page.waitForTimeout(200);
  expect(await draws()).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(draws).toBeGreaterThan(hidden);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
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
