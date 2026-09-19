import { describe, expect, it } from "vitest";
import { formatDateStamp, formatLongDate, formatWeekdayTime } from "./format";

const SABADO_19H = "2026-12-12T19:00:00-03:00";

describe("formatação de data", () => {
  it("monta o carimbo da capa", () => {
    expect(formatDateStamp(SABADO_19H)).toBe("12  |  12  |  2026");
  });

  it("escreve o dia da semana e a hora no padrão do convite", () => {
    expect(formatWeekdayTime(SABADO_19H)).toBe("sábado, às 19h00");
  });

  it("escreve a data por extenso", () => {
    expect(formatLongDate(SABADO_19H)).toBe("12 de dezembro de 2026");
  });

  it("lê a data no fuso de São Paulo, não no do servidor", () => {
    // 22h em UTC do dia 13 ainda é dia 12 no Brasil.
    expect(formatLongDate("2026-12-13T02:00:00Z")).toBe("12 de dezembro de 2026");
  });
});
