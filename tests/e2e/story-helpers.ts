import { expect, type Page } from "@playwright/test";
export async function atProgress(page: Page, progress: number) {
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
export async function canvasPixels(page: Page) {
  const png = await page.locator(".desktop-canvas canvas").screenshot({
    style: ".cinematic-artwork { visibility: hidden !important; }",
  });
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
