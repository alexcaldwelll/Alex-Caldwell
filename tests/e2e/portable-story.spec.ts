import { expect, test } from "@playwright/test";
import { atStop, layers } from "./story-helpers";

test("the pencil follows the reveal edge and previous layers persist until the flight", async ({ page }) => {
  await page.goto("/");
  await atStop(page, "seattle", 2.95);
  const visible = layers(page, "seattle");
  await expect(visible).toHaveCount(3);
  await expect(visible.last()).toHaveAttribute("src", /seattle-scene-lake/);
  await expect.poll(() => visible.last().evaluate(async image => {
    await (image as HTMLImageElement).decode();
    const landscape = image.parentElement!;
    const stage = landscape.closest(".road-stage")!;
    const pencil = stage.querySelector<SVGElement>(".travel-pencil")!;
    const maskFront = parseFloat((image as HTMLElement).style.getPropertyValue("--front")) / 100;
    return Math.abs(parseFloat(pencil.style.left) - (parseFloat(landscape.style.left) + parseFloat(landscape.style.width) * maskFront));
  })).toBeLessThan(1);
  await atStop(page, "seattle", 5.90);
  await expect(visible).toHaveCount(5);
  await expect(page.locator(".road-plane")).toBeHidden();
  await atStop(page, "seattle", 6.70);
  await expect(page.locator(".road-plane")).toBeVisible();
  await expect(page.locator(".seattle-landscape")).not.toHaveCSS("clip-path", "inset(0px 0px 0px 0%)");
  await atStop(page, "seattle", 2.95);
  await expect(visible).toHaveCount(3);
  await expect(page.locator(".road-plane")).toBeHidden();
  await atStop(page, "charleston", 5.84);
  await expect(layers(page, "charleston").last()).toHaveAttribute("src", /charleston-scene-civic/);
  await atStop(page, "charleston", 7.10);
  await expect(layers(page, "charleston").last()).toHaveAttribute("src", /charleston-scene-field/);
});
