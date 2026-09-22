import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Os testes de ponta a ponta são do Playwright, não do Vitest.
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // O carregador de fontes do Next não roda fora do compilador dele.
      "next/font/google": fileURLToPath(
        new URL("./src/test/next-font-stub.ts", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
