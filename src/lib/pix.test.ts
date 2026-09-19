import { describe, expect, it } from "vitest";
import { buildPixPayload, formatBRL } from "./pix";

/** Relê o payload EMV em pares id/tamanho/valor. */
function parse(payload: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let cursor = 0;
  while (cursor < payload.length - 4) {
    const id = payload.slice(cursor, cursor + 2);
    const length = Number(payload.slice(cursor + 2, cursor + 4));
    fields[id] = payload.slice(cursor + 4, cursor + 4 + length);
    cursor += 4 + length;
  }
  return fields;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const base = {
  key: "convite@exemplo.com.br",
  receiverName: "Guilherme Assis",
  city: "Sao Paulo",
};

describe("buildPixPayload", () => {
  it("monta um BR Code com os campos obrigatórios", () => {
    const fields = parse(buildPixPayload(base));

    expect(fields["00"]).toBe("01");
    expect(fields["26"]).toContain("BR.GOV.BCB.PIX");
    expect(fields["26"]).toContain(base.key);
    expect(fields["52"]).toBe("0000");
    expect(fields["53"]).toBe("986");
    expect(fields["58"]).toBe("BR");
    expect(fields["59"]).toBe("GUILHERME ASSIS");
    expect(fields["60"]).toBe("SAO PAULO");
  });

  it("fecha com um CRC16 válido", () => {
    const payload = buildPixPayload(base);
    const body = payload.slice(0, -4);

    expect(payload.slice(-8, -4)).toBe("6304");
    expect(payload.slice(-4)).toBe(crc16(body));
  });

  it("inclui o valor e marca o QR como de uso único quando há valor", () => {
    const fields = parse(buildPixPayload({ ...base, amount: 150.5 }));

    expect(fields["01"]).toBe("12");
    expect(fields["54"]).toBe("150.50");
  });

  it("omite o valor quando o convidado escolhe quanto dar", () => {
    const fields = parse(buildPixPayload(base));

    expect(fields["54"]).toBeUndefined();
    expect(fields["01"]).toBeUndefined();
  });

  it("remove acentos e corta o nome em 25 caracteres", () => {
    const fields = parse(
      buildPixPayload({
        ...base,
        receiverName: "José Antônio da Silva Gonçalves Júnior",
      }),
    );

    expect(fields["59"]).toBe("JOSE ANTONIO DA SILVA GON");
    expect(fields["59"].length).toBeLessThanOrEqual(25);
  });

  it("usa *** como txid padrão", () => {
    expect(parse(buildPixPayload(base))["62"]).toBe("0503***");
  });

  it("aceita chave aleatória, CPF e telefone", () => {
    for (const key of [
      "123e4567-e12b-12d1-a456-426655440000",
      "12345678900",
      "+5511999999999",
    ]) {
      const payload = buildPixPayload({ ...base, key });
      expect(parse(payload)["26"]).toContain(key);
      expect(payload.slice(-4)).toBe(crc16(payload.slice(0, -4)));
    }
  });
});

describe("formatBRL", () => {
  it("formata em real", () => {
    expect(formatBRL(150.5).replace(/ /g, " ")).toBe("R$ 150,50");
  });
});
