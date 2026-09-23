import { describe, expect, it } from "vitest";
import {
  countRows,
  filterRows,
  guestListCsv,
  guestRows,
  parseFilter,
  statusLabel,
} from "./guest-list";
import type { Household } from "./types";

const PRAZO = "2026-11-30T23:59:59-03:00";
const ANTES = new Date("2026-11-01T12:00:00-03:00");
const DEPOIS = new Date("2026-12-05T12:00:00-03:00");

function familia(
  family_name: string,
  guests: [string, "pending" | "confirmed" | "declined"][],
  extras: Partial<Household> = {},
): Household {
  return {
    id: family_name,
    event_id: "e",
    slug: family_name,
    family_name,
    greeting: null,
    phone: null,
    note: null,
    invite_status: "pending",
    invite_sent_at: null,
    responded_at: null,
    ...extras,
    guests: guests.map(([name, status], index) => ({
      id: `${family_name}-${index}`,
      name,
      is_child: false,
      position: index,
      status,
    })),
  } as Household;
}

const CASAS = [
  familia("Oliveira", [
    ["Ricardo", "confirmed"],
    ["Carla", "declined"],
    ["Pedro", "pending"],
  ], { phone: "5511999999999" }),
  familia("Souza", [["Ana", "confirmed"]]),
];

describe("guestRows", () => {
  it("achata as famílias mantendo a ordem", () => {
    const rows = guestRows(CASAS, PRAZO, ANTES);
    expect(rows.map((row) => row.name)).toEqual([
      "Ricardo",
      "Carla",
      "Pedro",
      "Ana",
    ]);
    expect(rows[0].family).toBe("Oliveira");
    expect(rows[0].phone).toBe("5511999999999");
  });

  it("antes do prazo, quem não respondeu fica pendente", () => {
    const pedro = guestRows(CASAS, PRAZO, ANTES).find((r) => r.name === "Pedro")!;
    expect(pedro.status).toBe("pending");
    expect(pedro.answered).toBe(false);
  });

  it("depois do prazo, quem não respondeu conta como ausente", () => {
    const pedro = guestRows(CASAS, PRAZO, DEPOIS).find((r) => r.name === "Pedro")!;
    expect(pedro.status).toBe("declined");
    // ...mas continua marcado como quem nunca respondeu.
    expect(pedro.answered).toBe(false);
  });
});

describe("filterRows", () => {
  const rows = guestRows(CASAS, PRAZO, ANTES);

  it("separa quem vai, quem não vai e quem calou", () => {
    expect(filterRows(rows, "confirmados").map((r) => r.name)).toEqual([
      "Ricardo",
      "Ana",
    ]);
    expect(filterRows(rows, "recusados").map((r) => r.name)).toEqual(["Carla"]);
    expect(filterRows(rows, "sem-resposta").map((r) => r.name)).toEqual(["Pedro"]);
    expect(filterRows(rows, "todos")).toHaveLength(4);
  });

  it("depois do prazo o silêncio entra em 'não vai' sem sair de 'sem resposta'", () => {
    const fechado = guestRows(CASAS, PRAZO, DEPOIS);
    expect(filterRows(fechado, "recusados").map((r) => r.name)).toEqual([
      "Carla",
      "Pedro",
    ]);
    expect(filterRows(fechado, "sem-resposta").map((r) => r.name)).toEqual([
      "Pedro",
    ]);
  });
});

describe("countRows", () => {
  it("conta cada situação", () => {
    expect(countRows(guestRows(CASAS, PRAZO, ANTES))).toEqual({
      todos: 4,
      confirmados: 2,
      recusados: 1,
      "sem-resposta": 1,
    });
  });
});

describe("statusLabel", () => {
  const rows = guestRows(CASAS, PRAZO, DEPOIS);

  it("distingue quem recusou de quem só não respondeu", () => {
    expect(statusLabel(rows.find((r) => r.name === "Carla")!)).toBe("não vai");
    expect(statusLabel(rows.find((r) => r.name === "Pedro")!)).toBe(
      "não vai (não respondeu no prazo)",
    );
  });
});

describe("parseFilter", () => {
  it("aceita os filtros conhecidos e cai em todos no resto", () => {
    expect(parseFilter("confirmados")).toBe("confirmados");
    expect(parseFilter("sem-resposta")).toBe("sem-resposta");
    expect(parseFilter("qualquer-coisa")).toBe("todos");
    expect(parseFilter(undefined)).toBe("todos");
  });
});

describe("guestListCsv", () => {
  it("monta cabeçalho e uma linha por pessoa", () => {
    const csv = guestListCsv(guestRows(CASAS, PRAZO, ANTES));
    const linhas = csv.split("\r\n");
    expect(linhas[0]).toBe("Convidado,Família,Situação,Criança,WhatsApp");
    expect(linhas[1]).toBe("Ricardo,Oliveira,vai,não,5511999999999");
    expect(linhas).toHaveLength(5);
  });

  it("protege vírgula e aspas dentro do nome", () => {
    const casa = familia("Silva", [['Ana "Aninha", filha', "confirmed"]]);
    const csv = guestListCsv(guestRows([casa], null));
    expect(csv.split("\r\n")[1]).toBe(
      '"Ana ""Aninha"", filha",Silva,vai,não,',
    );
  });

  it("não deixa um nome virar fórmula na planilha", () => {
    const casa = familia("Silva", [["=1+1", "confirmed"]]);
    expect(guestListCsv(guestRows([casa], null))).toContain("'=1+1");
  });
});
