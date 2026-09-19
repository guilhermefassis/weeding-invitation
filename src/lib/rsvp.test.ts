import { describe, expect, it } from "vitest";
import { countGuests, formatDeadline, isRsvpClosed, resolveGuestStatus } from "./rsvp";
import type { Guest } from "./types";

const DEADLINE = "2026-11-30T23:59:59-03:00";
const ANTES = new Date("2026-11-30T20:00:00-03:00");
const DEPOIS = new Date("2026-12-01T00:30:00-03:00");

function guest(name: string, status: Guest["status"]): Guest {
  return { id: name, name, is_child: false, position: 0, status };
}

describe("isRsvpClosed", () => {
  it("fica aberto até o fim do dia do prazo", () => {
    expect(isRsvpClosed(DEADLINE, ANTES)).toBe(false);
  });

  it("fecha depois do prazo", () => {
    expect(isRsvpClosed(DEADLINE, DEPOIS)).toBe(true);
  });

  it("nunca fecha quando não há prazo", () => {
    expect(isRsvpClosed(null, DEPOIS)).toBe(false);
  });
});

describe("resolveGuestStatus", () => {
  it("conta quem não respondeu como ausente depois do prazo", () => {
    expect(resolveGuestStatus("pending", DEADLINE, DEPOIS)).toBe("declined");
  });

  it("mantém pendente enquanto o prazo está aberto", () => {
    expect(resolveGuestStatus("pending", DEADLINE, ANTES)).toBe("pending");
  });

  it("não mexe em quem já respondeu", () => {
    expect(resolveGuestStatus("confirmed", DEADLINE, DEPOIS)).toBe("confirmed");
    expect(resolveGuestStatus("declined", DEADLINE, DEPOIS)).toBe("declined");
  });
});

describe("countGuests", () => {
  const guests = [
    guest("Ricardo", "confirmed"),
    guest("Carla", "declined"),
    guest("Pedro", "pending"),
  ];

  it("antes do prazo separa quem não respondeu", () => {
    expect(countGuests(guests, DEADLINE, ANTES)).toEqual({
      total: 3,
      confirmed: 1,
      declined: 1,
      silent: 1,
    });
  });

  it("depois do prazo soma quem não respondeu aos ausentes", () => {
    expect(countGuests(guests, DEADLINE, DEPOIS)).toEqual({
      total: 3,
      confirmed: 1,
      declined: 2,
      silent: 1,
    });
  });
});

describe("formatDeadline", () => {
  it("escreve a data por extenso", () => {
    expect(formatDeadline(DEADLINE)).toBe("30 de novembro");
  });
});
