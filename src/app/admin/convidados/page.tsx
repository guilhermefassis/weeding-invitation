import { headers } from "next/headers";
import { getAdminEvent, listHouseholds } from "@/lib/admin-data";
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  inviteUrl,
  renderTemplate,
} from "@/lib/whatsapp";
import { hasCloudApi } from "@/lib/whatsapp-cloud";
import { deleteHousehold, saveHousehold } from "../actions";
import { HouseholdActions } from "./HouseholdActions";

const STATUS_LABEL = {
  pending: "sem resposta",
  confirmed: "vai",
  declined: "não vai",
} as const;

async function resolveBaseUrl(configured: string | null): Promise<string> {
  if (configured) return configured;
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export default async function GuestsAdmin() {
  const event = await getAdminEvent();
  if (!event) return <p>Nenhum evento cadastrado.</p>;

  const households = await listHouseholds(event.id);
  const baseUrl = await resolveBaseUrl(event.base_url);
  const template = event.whatsapp_template ?? DEFAULT_WHATSAPP_TEMPLATE;
  const cloudApi = hasCloudApi();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium">Convidados</h1>
        <p className="text-sm text-zinc-500">
          Cada família tem um link próprio. Um nome por linha; escreva
          &quot;(criança)&quot; no fim do nome para marcar como criança.
        </p>
      </header>

      <details className="rounded-xl border border-dashed border-zinc-300 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium">
          + Nova família
        </summary>
        <form action={saveHousehold} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="event_id" value={event.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              name="family_name"
              placeholder="Família Oliveira"
              required
            />
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              name="greeting"
              placeholder="Ricardo e família"
            />
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              name="phone"
              placeholder="11 99999-9999"
            />
          </div>
          <textarea
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            name="guests"
            rows={4}
            placeholder={"Ricardo Oliveira\nCarla Oliveira\nPedro Oliveira (criança)"}
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
          >
            Criar família
          </button>
        </form>
      </details>

      {households.map((household) => {
        const link = inviteUrl(baseUrl, household.slug);
        const message = renderTemplate(template, event, household, baseUrl);
        const confirmed = household.guests.filter(
          (guest) => guest.status === "confirmed",
        ).length;

        return (
          <details
            key={household.id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
              <span className="font-medium">{household.family_name}</span>
              <span className="text-xs text-zinc-400">
                {confirmed}/{household.guests.length} confirmados
              </span>
              {household.invite_status === "sent" && (
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                  convite enviado
                </span>
              )}
              {household.invite_status === "failed" && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                  falha no envio
                </span>
              )}
              {household.responded_at && (
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  respondeu
                </span>
              )}
            </summary>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="font-mono text-xs break-all text-zinc-500">{link}</p>
                <div className="mt-2">
                  <HouseholdActions
                    householdId={household.id}
                    link={link}
                    message={message}
                    phone={household.phone}
                    cloudApi={cloudApi}
                  />
                </div>
              </div>

              {household.guests.length > 0 && (
                <ul className="flex flex-wrap gap-2 text-xs">
                  {household.guests.map((guest) => (
                    <li
                      key={guest.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600"
                    >
                      {guest.name} · {STATUS_LABEL[guest.status]}
                    </li>
                  ))}
                </ul>
              )}

              {household.note && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  {household.note}
                </p>
              )}

              <form action={saveHousehold} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={household.id} />
                <input type="hidden" name="event_id" value={event.id} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="family_name"
                    defaultValue={household.family_name}
                  />
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="greeting"
                    defaultValue={household.greeting ?? ""}
                    placeholder="Saudação"
                  />
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="phone"
                    defaultValue={household.phone ?? ""}
                    placeholder="WhatsApp"
                  />
                </div>
                <textarea
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  name="guests"
                  rows={Math.max(3, household.guests.length + 1)}
                  defaultValue={household.guests
                    .map((guest) => (guest.is_child ? `${guest.name} (criança)` : guest.name))
                    .join("\n")}
                />
                <button
                  type="submit"
                  className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
                >
                  Salvar
                </button>
              </form>

              <form action={deleteHousehold}>
                <input type="hidden" name="id" value={household.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Excluir família
                </button>
              </form>
            </div>
          </details>
        );
      })}
    </div>
  );
}
