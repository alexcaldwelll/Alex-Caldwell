import { expect, test } from "@playwright/test";
import { canvasPixels } from "./story-helpers";
test("context loss restores the complete static journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  // Lose an initialized, visibly rendered context, not a just-created element.
  await expect.poll(async () => (await canvasPixels(page)).yellow).toBeGreaterThan(9000);
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
