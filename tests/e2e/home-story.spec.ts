import { expect, test } from "@playwright/test";
import { atStop, layers } from "./story-helpers";

for (const mode of ["reduced", "mobile"] as const) {
  test(`${mode} uses the complete illustrated fallback`, async ({ page }) => {
    if (mode === "reduced") await page.emulateMedia({ reducedMotion: "reduce" });
    else await page.setViewportSize({ width: 390, height: 844 });
    const requested: string[] = [];
    page.on("request", request => requested.push(request.url()));
    await page.goto("/");
    await expect(page.locator(".static-journey")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".static-journey img")).toHaveCount(6);
    expect(requested.filter(url => /StoryExperience|StoryCanvas|three\.js|gsap|lenis/.test(url))).toEqual([]);
  });
}

test("canvas initialization failure keeps the illustrated story and Blog available", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type, ...args) {
      if (type === "2d") return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".road-world")).toHaveCount(0);
  await expect(page.locator(".static-journey")).toBeVisible();
  await page.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
});

test("the empty-road opening and Seattle load without fetching later drawing layers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".opening-road img")).toHaveAttribute("src", /seattle-scene-road/);
  await expect(page.locator(".opening-pencil")).toBeVisible();
  await expect(page.locator(".road-plane")).toBeHidden();
  await expect(layers(page, "seattle")).toHaveCount(1);
  await expect(page.locator(".nashville-landscape img[src]")).toHaveCount(0);
});

test("DC field gives way to the clinic and the church survives the Nashville flight", async ({ page }) => {
  await page.goto("/");
  await atStop(page, "dc", 4.58);
  await expect(layers(page, "dc").last()).toHaveAttribute("src", /dc-scene-church/);
  await atStop(page, "dc", 6.02);
  await expect(layers(page, "dc").last()).toHaveAttribute("src", /dc-scene-clinic/);
  await expect(page.locator(".road-plane")).toBeHidden();
  await atStop(page, "dc", 6.80);
  await expect(page.locator(".road-plane")).toBeVisible();
  await expect(page.locator(".landscape-survivor")).toBeVisible();
  await atStop(page, "nashville", 2.32);
  await expect(layers(page, "nashville").last()).toHaveAttribute("src", /nashville-scene-campus/);
  await atStop(page, "nashville", 4.60);
  await expect(layers(page, "nashville").last()).toHaveAttribute("src", /nashville-scene-broadway/);
  await expect(page.locator(".road-stage .travel-pencil")).toBeVisible();
  await expect(page.locator(".road-plane")).toBeHidden();
});

test("chapter links jump within the continuous story", async ({ page }) => {
  await page.goto("/");
  await atStop(page, "seattle", 2);
  await page.getByRole("navigation", { name: "Jump to a city" }).getByRole("link", { name: "Charleston" }).click();
  await expect(page).toHaveURL(/#charleston$/);
  await expect(page.locator(".road-world")).toHaveAttribute("data-chapter", "charleston");
  await expect(page.getByRole("link", { name: "Charleston" })).toHaveAttribute("aria-current", "location");
});
