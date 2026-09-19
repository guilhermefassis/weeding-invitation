import { defineConfig, devices } from "@playwright/test";

/**
 * Os testes rodam sem Supabase: o app cai no modo demonstração e serve o
 * convite de exemplo em /convite/demo.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Cada virada de página leva ~1s; folhear o convite inteiro passa de 10s.
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
