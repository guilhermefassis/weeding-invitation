import { describe, expect, it } from "vitest";
import { FONT_PAIRS, fontPair } from "@/lib/fonts";
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

  it("ignora a cor em branco, deixando o padrão do CSS valer", () => {
    expect(themeStyle({ accent: "", ink: "#111" })).toEqual({
      "--color-ink": "#111",
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

  it("aplica as duas fontes do par escolhido", () => {
    const style = themeStyle({ font_pair: "romantico" });
    expect(style).toMatchObject({
      "--serif": FONT_PAIRS.romantico.text,
      "--handwriting": FONT_PAIRS.romantico.display,
    });
  });

  it("ignora par desconhecido em vez de deixar o convite sem fonte", () => {
    expect(themeStyle({ font_pair: "nao-existe" })).toEqual({});
  });

  it("publica o tamanho do texto para quem mede em vw", () => {
    expect(themeStyle({ font_scale: 1.15 })).toEqual({ "--font-scale": "1.15" });
  });
});

describe("fontPair", () => {
  it("cai no padrão quando a chave não existe ou está vazia", () => {
    expect(fontPair(undefined)).toBe(FONT_PAIRS.classico);
    expect(fontPair("nao-existe")).toBe(FONT_PAIRS.classico);
  });

  it("devolve o par pedido", () => {
    expect(fontPair("editorial")).toBe(FONT_PAIRS.editorial);
  });

  it("todo par tem as duas fontes definidas", () => {
    for (const [chave, par] of Object.entries(FONT_PAIRS)) {
      expect(par.text, chave).toBeTruthy();
      expect(par.display, chave).toBeTruthy();
    }
  });
});
