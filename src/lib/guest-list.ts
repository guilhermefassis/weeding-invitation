import { resolveGuestStatus } from "./rsvp";
import type { GuestStatus, Household } from "./types";

export type GuestRow = {
  id: string;
  name: string;
  isChild: boolean;
  family: string;
  phone: string | null;
  /** Situação já resolvida pelo prazo: passado o prazo, quem calou não vai. */
  status: GuestStatus;
  /** Se a família chegou a responder. Separa "não vai" de "não respondeu". */
  answered: boolean;
};

export const LIST_FILTERS = [
  "todos",
  "confirmados",
  "recusados",
  "sem-resposta",
] as const;

export type ListFilter = (typeof LIST_FILTERS)[number];

export function parseFilter(value: string | undefined): ListFilter {
  return LIST_FILTERS.includes(value as ListFilter)
    ? (value as ListFilter)
    : "todos";
}

/** Achata as famílias numa lista de pessoas, mantendo a ordem do painel. */
export function guestRows(
  households: Household[],
  deadline: string | null,
  now?: Date,
): GuestRow[] {
  return households.flatMap((household) =>
    household.guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      isChild: guest.is_child,
      family: household.family_name,
      phone: household.phone,
      status: resolveGuestStatus(guest.status, deadline, now),
      answered: guest.status !== "pending",
    })),
  );
}

export function filterRows(rows: GuestRow[], filter: ListFilter): GuestRow[] {
  switch (filter) {
    case "confirmados":
      return rows.filter((row) => row.status === "confirmed");
    case "recusados":
      return rows.filter((row) => row.status === "declined");
    case "sem-resposta":
      return rows.filter((row) => !row.answered);
    default:
      return rows;
  }
}

export function countRows(rows: GuestRow[]) {
  return {
    todos: rows.length,
    confirmados: rows.filter((row) => row.status === "confirmed").length,
    recusados: rows.filter((row) => row.status === "declined").length,
    "sem-resposta": rows.filter((row) => !row.answered).length,
  } satisfies Record<ListFilter, number>;
}

export function statusLabel(row: GuestRow): string {
  if (row.status === "confirmed") return "vai";
  if (row.status === "declined") {
    return row.answered ? "não vai" : "não vai (não respondeu no prazo)";
  }
  return "sem resposta";
}

/**
 * Uma célula que começa com =, +, - ou @ vira fórmula ao abrir no Excel. Um
 * apóstrofo na frente faz a planilha tratar como texto — e o nome de um
 * convidado não deveria poder executar nada.
 */
function escapeCell(value: string): string {
  const seguro = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

export function guestListCsv(rows: GuestRow[]): string {
  const linhas = [
    ["Convidado", "Família", "Situação", "Criança", "WhatsApp"],
    ...rows.map((row) => [
      row.name,
      row.family,
      statusLabel(row),
      row.isChild ? "sim" : "não",
      row.phone ?? "",
    ]),
  ];

  return linhas.map((linha) => linha.map(escapeCell).join(",")).join("\r\n");
}
