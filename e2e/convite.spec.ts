import { expect, test, type Page } from "@playwright/test";

const CONVITE = "/convite/demo";

/** Vira para frente e espera o estado assentar, em vez de dormir um tempo fixo. */
async function next(page: Page, target = 1) {
  await page.getByRole("button", { name: "Próxima página" }).click();
  await expect(page.locator(".book-dots i").nth(target)).toHaveAttribute(
    "data-on",
    "true",
  );
}

/** Espera a página de destino aparecer depois de tocar num ícone do menu. */
async function abrir(page: Page, label: string, heading: RegExp | string) {
  await page.getByRole("button", { name: label }).click();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(CONVITE);
  // O convite abre num envelope lacrado; o livro só aparece quando ele sai.
  const envelope = page.getByRole("button", { name: "Abrir o convite" });
  await envelope.click();
  await expect(envelope).toHaveCount(0);
});

test.describe("envelope", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("traz o lacre com as iniciais e o nome da família", async ({ page }) => {
    await page.goto(CONVITE);

    const envelope = page.getByRole("button", { name: "Abrir o convite" });
    await expect(envelope).toBeVisible();
    await expect(envelope).toContainText("Ricardo e família");
    await expect(page.locator(".envelope-seal-face")).toContainText("GF");

    await envelope.click();
    await expect(envelope).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Guilherme & Fernanda" })).toBeVisible();
  });
});

test("a capa traz o casal, a data e a saudação da família", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Guilherme & Fernanda" })).toBeVisible();
  await expect(page.getByText("12  |  12  |  2026")).toBeVisible();
  await expect(page.getByText("sábado, às 19h00", { exact: true })).toBeVisible();
  await expect(page.getByText("Ricardo e família")).toBeVisible();
});

test("o menu de ícones leva direto para a página de confirmação", async ({ page }) => {
  await next(page);
  await abrir(page, "Confirmar presença", "Quem vem com você?");
});

test("a família confirma cada integrante de uma vez", async ({ page }) => {
  await next(page);
  await abrir(page, "Confirmar presença", "Quem vem com você?");

  await expect(page.getByText("Confirme até 30 de novembro")).toBeVisible();

  const confirmar = page.getByRole("button", { name: "Confirmar", exact: true });
  await expect(confirmar).toBeDisabled();

  for (const nome of ["Ricardo Oliveira", "Carla Oliveira", "Pedro Oliveira"]) {
    await page
      .locator("li")
      .filter({ hasText: nome })
      .getByRole("button", { name: "Vou", exact: true })
      .click();
  }

  await page.getByPlaceholder("Restrição alimentar").fill("Chegamos umas 19h30");
  await expect(confirmar).toBeEnabled();
  await confirmar.click();

  await expect(page.getByText("Obrigado!")).toBeVisible();
  await expect(page.getByText("Anotamos 3 presenças")).toBeVisible();
});

test("quem recusa vê a mensagem de ausência", async ({ page }) => {
  await next(page);
  await abrir(page, "Confirmar presença", "Quem vem com você?");

  for (const nome of ["Ricardo Oliveira", "Carla Oliveira", "Pedro Oliveira"]) {
    await page
      .locator("li")
      .filter({ hasText: nome })
      .getByRole("button", { name: "Não vou" })
      .click();
  }

  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByText("Sentiremos sua falta")).toBeVisible();
});

test("a página de presente gera o PIX e copia o código", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  // A área de transferência exige documento em foco.
  await page.bringToFront();

  await next(page);
  await abrir(page, "Para nos presentear", "Presente via PIX");

  await expect(page.getByAltText("QR Code do PIX")).toBeVisible();
  await expect(page.getByText("Sem valor definido")).toBeVisible();

  await page.getByRole("button", { name: "R$ 100,00" }).click();
  await expect(page.getByText("Valor: R$ 100,00")).toBeVisible();

  await page.getByRole("button", { name: "Copiar código PIX" }).click();
  await expect(page.getByRole("button", { name: "Código copiado!" })).toBeVisible();

  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado.startsWith("000201")).toBe(true);
  expect(copiado).toContain("convite@exemplo.com.br");
  expect(copiado).toContain("5406100.00");
});

test("a localização abre rota no Google Maps e no Waze", async ({ page }) => {
  await next(page);
  await abrir(page, "Saiba como chegar", "O lugar");

  await expect(
    page.getByText("Rua das Palmeiras, 120 — Itaipava, Petrópolis/RJ"),
  ).toBeVisible();

  const maps = page.getByRole("link", { name: "Abrir no Google Maps" });
  await expect(maps).toHaveAttribute("href", /google\.com\/maps/);
  await expect(page.getByRole("link", { name: "Abrir no Waze" })).toHaveAttribute(
    "href",
    /waze\.com/,
  );
});

test("dá para folhear até o encerramento e voltar", async ({ page }) => {
  for (let i = 1; i <= 8; i++) await next(page, i);

  await expect(page.getByRole("heading", { name: "Esperamos por você" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Próxima página" })).toBeDisabled();

  await page.getByRole("button", { name: "Página anterior" }).click();
  await expect(page.getByRole("heading", { name: "Boas-vindas" })).toBeVisible();
});

test("o convite não é indexado por buscadores", async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
