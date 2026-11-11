import { expect, test } from "@playwright/test";
import { atStop, layers, type City } from "./story-helpers";

test("installed Chrome renders the four finished compositions at desktop widths", async ({ page }, testInfo) => {
  await page.goto("/");
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [city, local, file] of [
      ["seattle", 5.90, "field"],
      ["charleston", 7.10, "field"],
      ["dc", 6.02, "clinic"],
      ["nashville", 4.60, "broadway"],
    ] satisfies [City, number, string][]) {
      await atStop(page, city, local);
      const image = layers(page, city).last();
      await expect(image).toHaveAttribute("src", new RegExp(`-${file}-?[^/]*\\.webp$`));
      await expect.poll(() => image.evaluate(async (img: HTMLImageElement) => { await img.decode(); return img.naturalWidth; })).toBe(1279);
      const screenshot = await page.screenshot();
      await testInfo.attach(`${city}-${width}`, { body: screenshot, contentType: "image/png" });
    }
  }
});
