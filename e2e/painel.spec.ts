import { expect, test } from "@playwright/test";

test("o painel exige login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/entrar$/);
});

test("a home leva ao convite de exemplo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver o convite de exemplo" }).click();
  await expect(page).toHaveURL(/\/convite\/demo$/);
});
