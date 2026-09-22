import { describe, expect, it } from "vitest";
import { contrastRatio, contrastVerdict, parseColor } from "./contrast";

describe("parseColor", () => {
  it("lê hex de 6 e de 3 dígitos", () => {
    expect(parseColor("#f2efe7")).toEqual([242, 239, 231]);
    expect(parseColor("#FFF")).toEqual([255, 255, 255]);
  });

  it("lê rgb() com vírgula ou espaço", () => {
    expect(parseColor("rgb(70, 86, 76)")).toEqual([70, 86, 76]);
    expect(parseColor("rgb(70 86 76)")).toEqual([70, 86, 76]);
  });

  it("devolve null no que não é cor", () => {
    expect(parseColor("azul")).toBeNull();
    expect(parseColor("#12345")).toBeNull();
    expect(parseColor("")).toBeNull();
  });
});

describe("contrastRatio", () => {
  it("bate com os extremos conhecidos da fórmula", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("não depende da ordem das cores", () => {
    const a = contrastRatio("#46564c", "#f2efe7");
    const b = contrastRatio("#f2efe7", "#46564c");
    expect(a).toBeCloseTo(b!, 10);
  });

  it("devolve null quando alguma cor não é lida", () => {
    expect(contrastRatio("verde", "#ffffff")).toBeNull();
  });
});

describe("as cores padrão do convite passam no AA", () => {
  const papel = "#f2efe7";

  it("texto principal", () => {
    expect(contrastRatio("#22302a", papel)!).toBeGreaterThanOrEqual(4.5);
  });

  it("texto suave", () => {
    expect(contrastRatio("#46564c", papel)!).toBeGreaterThanOrEqual(4.5);
  });

  it("destaque em texto, já escurecido para leitura", () => {
    expect(contrastRatio("#736440", papel)!).toBeGreaterThanOrEqual(4.5);
  });

  it("o dourado cheio não passaria — por isso ele fica só nos filetes", () => {
    expect(contrastRatio("#9a8550", papel)!).toBeLessThan(4.5);
  });
});

describe("contrastVerdict", () => {
  it("classifica pelos cortes do WCAG", () => {
    expect(contrastVerdict(7)).toBe("bom");
    expect(contrastVerdict(4.5)).toBe("bom");
    expect(contrastVerdict(3.2)).toBe("limite");
    expect(contrastVerdict(2.1)).toBe("ruim");
  });
});
