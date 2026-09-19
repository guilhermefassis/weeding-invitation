import type { Guest, GuestStatus } from "./types";

/** O prazo vence no fim do dia informado. */
export function isRsvpClosed(
  deadline: string | null,
  now: Date = new Date(),
): boolean {
  if (!deadline) return false;
  return now.getTime() > new Date(deadline).getTime();
}

/**
 * Passado o prazo, quem não respondeu conta como ausente — é assim que o
 * anfitrião fecha o número com o buffet.
 */
export function resolveGuestStatus(
  status: GuestStatus,
  deadline: string | null,
  now?: Date,
): GuestStatus {
  if (status === "pending" && isRsvpClosed(deadline, now)) return "declined";
  return status;
}

export function countGuests(
  guests: Guest[],
  deadline: string | null,
  now?: Date,
) {
  const resolved = guests.map((guest) =>
    resolveGuestStatus(guest.status, deadline, now),
  );

  return {
    total: guests.length,
    confirmed: resolved.filter((status) => status === "confirmed").length,
    declined: resolved.filter((status) => status === "declined").length,
    silent: guests.filter((guest) => guest.status === "pending").length,
  };
}

export function formatDeadline(deadline: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
  }).format(new Date(deadline));
}
