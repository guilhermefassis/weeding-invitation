import type { EventRecord, Household } from "./types";

export const DEFAULT_WHATSAPP_TEMPLATE = `Oi, {saudacao}! 💛

{casal} tem o prazer de convidar vocês para {titulo}, no dia {data}, em {local}.

O convite de vocês é este aqui — abre para ver tudo e confirmar presença:
{link}

Contamos com vocês!`;

/** Normaliza para E.164 sem "+" (formato que o wa.me e a Cloud API esperam). */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export function inviteUrl(baseUrl: string, householdSlug: string): string {
  return `${baseUrl.replace(/\/$/, "")}/convite/${householdSlug}`;
}

export function renderTemplate(
  template: string,
  event: EventRecord,
  household: Pick<Household, "slug" | "family_name" | "greeting">,
  baseUrl: string,
): string {
  const date = new Date(event.event_date);
  const values: Record<string, string> = {
    saudacao: household.greeting || household.family_name,
    familia: household.family_name,
    casal: event.couple_names,
    titulo: event.title,
    data: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    hora: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    local: event.venue_name ?? "",
    link: inviteUrl(baseUrl, household.slug),
  };

  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key] : match,
  );
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
