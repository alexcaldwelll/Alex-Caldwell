import { expect, type Page } from "@playwright/test";

const starts = { seattle: 0, charleston: 7.55, dc: 16.23, nashville: 23.78 };
const total = 28.44;
export type City = keyof typeof starts;

export async function atStop(page: Page, city: City, local: number) {
  const world = page.locator(".road-world");
  await world.evaluate((element, progress) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top + (rect.height - window.innerHeight) * progress);
  }, (starts[city] + local) / total);
  await expect(world).toHaveAttribute("data-chapter", city);
  await expect.poll(async () => Number(await world.getAttribute("data-local"))).toBeCloseTo(local, 1);
}

export function layers(page: Page, city: City) {
  return page.locator(`.${city}-landscape img:not([hidden])`);
}
