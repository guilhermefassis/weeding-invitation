import { describe, expect, it } from "vitest";
import { themeStyle } from "./theme";

describe("themeStyle", () => {
  it("não define nada quando o tema está vazio", () => {
    expect(themeStyle({})).toEqual({});
  });

  it("transforma cores em custom properties", () => {
    expect(themeStyle({ accent: "#9a8550", seal: "#c7b23a" })).toEqual({
      "--color-accent": "#9a8550",
      "--color-seal": "#c7b23a",
    });
  });

  it("transforma os tamanhos do envelope em multiplicadores", () => {
    expect(
      themeStyle({ seal_scale: 1.4, monogram_scale: 0.8, emboss_scale: 1 }),
    ).toEqual({
      "--seal-scale": "1.4",
      "--monogram-scale": "0.8",
      "--emboss-scale": "1",
    });
  });

  it("ignora tamanho inválido em vez de escrever NaN no CSS", () => {
    expect(themeStyle({ seal_scale: Number.NaN })).toEqual({});
  });
});
