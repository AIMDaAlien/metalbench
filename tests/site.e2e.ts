import { expect, test } from "@playwright/test";
const routes = [
  "/",
  "/compare/",
  "/models/qwen36-nvfp4/",
  "/hardware/unraid-128gb-rtx3060/",
  "/runs/qwen36-nvfp4-agent-2026-08-28/",
  "/methodology/",
  "/findings/",
  "/findings/speculative-decoding-memory-wall/",
];
for (const route of routes)
  test(`renders ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (["error", "warning"].includes(msg.type())) errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
test("compares multiple models with keyboard focus", async ({ page }) => {
  await page.goto("/compare/");
  await expect(page.getByText("Comparable", { exact: true })).toBeVisible();
  await page.getByLabel(/Flash-Next IQ3_XXS/).check();
  await expect(page.getByText("Comparison blocked")).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe(
    "BODY",
  );
});
test("unknown records are 404", async ({ request }) => {
  expect((await request.get("/runs/not-a-run/")).status()).toBe(404);
  expect((await request.get("/models/not-a-model/")).status()).toBe(404);
});
