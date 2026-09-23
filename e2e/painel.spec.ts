import { expect, test } from "@playwright/test";

test("o painel exige login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/entrar$/);
});

test("a lista de convidados e a planilha também exigem login", async ({ page }) => {
  await page.goto("/admin/lista?filtro=confirmados");
  await expect(page).toHaveURL(/\/entrar$/);

  // A planilha é uma rota própria: sem sessão, ela não pode servir os nomes.
  const resposta = await page.goto("/admin/lista/csv");
  expect(resposta?.headers()["content-type"]).not.toContain("text/csv");
  await expect(page).toHaveURL(/\/entrar$/);
});

test("a home leva ao convite de exemplo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver o convite de exemplo" }).click();
  await expect(page).toHaveURL(/\/convite\/demo$/);
});
