import { describe, expect, it } from "vitest";
import { themeStyle } from "./theme";

describe("themeStyle", () => {
  it("traduz as cores do painel em custom properties", () => {
    expect(themeStyle({ accent: "#123456", seal: "#abcdef" })).toEqual({
      "--color-accent": "#123456",
      "--color-seal": "#abcdef",
    });
  });

  it("ignora o que não foi configurado, deixando o padrão do CSS valer", () => {
    expect(themeStyle({})).toEqual({});
    expect(themeStyle({ accent: "", ink: "#111" })).toEqual({ "--color-ink": "#111" });
  });
});
